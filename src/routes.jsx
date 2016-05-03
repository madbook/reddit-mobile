// This file maps url routes to React element changes.

import React from 'react';
import querystring from 'querystring';

import merge from 'lodash/object/merge';
import url from 'url';

// components
import BodyLayout from './views/layouts/BodyLayout';
import Layout from './views/layouts/DefaultLayout';

import TextSubNav from './views/components/TextSubNav';

import IndexPage from './views/pages/index';
import ListingPage from './views/pages/listing';
import SubredditAboutPage from './views/pages/subredditAbout';
import SearchPage from './views/pages/search';
import UserProfilePage from './views/pages/userProfile';
import UserGildPage from './views/pages/userGild';
import UserActivityPage from './views/pages/userActivity';
import UserSavedPage from './views/pages/userSaved';
import FAQPage from './views/pages/faq';
import LoginPage from './views/pages/login';
import MessagesPage from './views/pages/messages';
import MessageComposePage from './views/pages/messageCompose';
import SubmitPage from './views/pages/submit';
import WikiPage from './views/pages/wikipage';

import constants from './constants';
import defaultConfig from './config';
import { SORTS } from './sortValues';
import isFakeSubreddit, { randomSubs } from './lib/isFakeSubreddit';
import makeRequest from './lib/makeRequest';
import features from './featureflags';

const config = defaultConfig;

function setData(ctx, key, endpoint, options) {
  const api = ctx.props.app.api;

  if (ctx.props.dataCache && ctx.props.dataCache[key]) {
    api.hydrate(endpoint, options, ctx.props.dataCache[key]);
    ctx.props.data.set(key, Promise.resolve(ctx.props.dataCache[key]));
  } else {
    ctx.props.data.set(key, api[endpoint].get(options));
  }
}

function buildAPIOptions(ctx, options={}) {
  const apiOrigin = ctx.token ? 'authAPIOrigin' : 'nonAuthAPIOrigin';
  const app = ctx.props.app;

  const apiOptions = merge({
    origin: app.getConfig(apiOrigin),
    headers: { },
    env: ctx.env || 'SERVER',
  }, options);

  if (ctx.headers['user-agent']) {
    apiOptions.headers['user-agent'] = ctx.headers['user-agent'];
  }

  if (ctx.token) {
    apiOptions.headers.Authorization = `bearer ${ctx.token}`;
  }

  if ((ctx.env === 'SERVER') && ctx.loid) {
    apiOptions.headers.cookie = `loid=${ctx.loid}; loidcreated=${ctx.loidcreated}`;
  }

  if (app.config.apiPassThroughHeaders) {
    let h;
    for (h in ctx.headers) {
      if (app.config.apiPassThroughHeaders.indexOf(h) > -1) {
        apiOptions.headers[h] = ctx.headers[h];
      }
    }
  }

  return app.api.buildOptions(apiOptions);
}

// Filter the props we want to expose to the react elements.
function filterContextProps(ctx) {
  return {
    path: ctx.path,
    query: ctx.query,
    params: ctx.params,
    url: ctx.path,
    userAgent: ctx.userAgent,
    csrf: ctx.csrf,
    referrer: ctx.headers.referer,
    token: ctx.token,
    tokenExpires: ctx.tokenExpires,
    redirect: ctx.redirect,
    env: ctx.env,
    notifications: ctx.notifications,
  };
}

export function buildProps(ctx, app) {
  const clientConfig = {};

  let c;
  for (c in config) {
    clientConfig[c] = app.getConfig(c);
  }

  ctx.props = {
    app,
    title: 'reddit: the front page of the internet',
    metaDescription: 'reddit: the front page of the internet',
    data: new Map(),
    dataCache: ctx.dataCache,
    ctx: filterContextProps(ctx),
    compact: ctx.compact,
    theme: ctx.theme,
    experiments: ctx.experiments,
    token: ctx.token,
    loid: ctx.loid,
    loidcreated: ctx.loidcreated,
    tokenExpires: ctx.tokenExpires,
    config: clientConfig,
    render: Date.now(),
    actionName: ctx.route.name,
    showOver18Interstitial: ctx.showOver18Interstitial,
    random: app.randomBySeed,
    key: app.randomBySeed(),
    showEUCookieMessage: ctx.showEUCookieMessage,
    showGlobalMessage: ctx.showGlobalMessage,
    country: ctx.country,
  };

  ctx.props.apiOptions = buildAPIOptions(ctx);

  return ctx.props;
}

function getSubreddit(ctx) {
  const { subreddit } = ctx.params;

  if (subreddit) {
    Object.assign(ctx.props, {
      subredditName: subreddit,
      topNavLink: `/r/${subreddit}`,
      title: `r/${subreddit}`,
      metaDescription: `r/${subreddit} at reddit.com`,
    });

    if (!isFakeSubreddit(subreddit)) {
      const subredditOpts = buildAPIOptions(ctx, {
        id: subreddit.toLowerCase(),
      });

      setData(ctx, 'subreddit', 'subreddits', subredditOpts);
    }
  }
}

export function userData(ctx, app) {
  const { apiOptions } = ctx.props;

  if (ctx.props.token) {
    const userOptions = Object.assign({}, apiOptions, {
      user: 'me',
    });

    setData(ctx, 'user', 'users', userOptions);

    const prefOptions = Object.assign({}, apiOptions);
    setData(ctx, 'preferences', 'preferences', prefOptions);

    const subOptions = Object.assign({}, apiOptions, {
      query: {
        sort: 'mine/subscriber',
        sr_detail: true,
        feature: 'mobile_settings',
        limit: 250,
      },
    });

    let userAgent;

    if (ctx.headers) {
      userAgent = ctx.headers['user-agent'];
    } else if (apiOptions.headers) {
      userAgent = apiOptions.headers['user-agent'];
    }

    subOptions.headers['user-agent'] = userAgent;
    setData(ctx, 'userSubscriptions', 'subreddits', subOptions);
  } else {
    const userOptions = Object.assign({}, apiOptions, {
      loggedOut: true,
    });

    setData(ctx, 'loggedOutUser', 'users', userOptions);
    const subOptions = Object.assign({}, apiOptions, {
      query: {
        sort: 'default',
        sr_detail: true,
        feature: 'mobile_settings',
        limit: 250,
      },
      origin: app.getConfig('nonAuthAPIOrigin'),
    });
    delete subOptions.headers.Authorization;
    setData(ctx, 'userSubscriptions', 'subreddits', subOptions);
  }
}

function makeBody() {
  return (props) => {
    const content = Array.prototype.map.call(arguments, (comp, i) => {
      if (Array.isArray(comp)) {
        const [Component, propOveride] = comp;
        return <Component {...(propOveride || props)} key={ `${props.key}-${i} ` } />;
      }

      const Component = comp;
      return <Component {... props} key={ `${props.key}-${i}` } />;
    });

    return (
      // Note: please don't set a key here, as it will make React re-use the
      // component when it really shouldn't. Properties that are promises,
      // whose result is based on the state of the cache, won't be picked up
      // as new props. Setting a key will break state when the cache has updated.
      <BodyLayout { ...props }>
        { content }
      </BodyLayout>
    );
  };
}


function * globalMessage(next) {
  const config = this.props.config;
  const message = config.globalMessage ? Object.assign({}, config.globalMessage): null;
  const routeName = this.route.name;

  if (message && this.props.showGlobalMessage) {
    if (message.frontPageOnly && routeName !== 'index') {
      return yield next;
    }

    const isOngoing = new Date(message.expires) > Date.now();
    if (isOngoing) {
      message.type = constants.messageTypes.GLOBAL;

      this.props.globalMessage = message;
    }
  }
  yield next;
}

export function loginRegisterOriginalUrl(query, headers) {
  let redirectUrl;

  if (query && query.originalUrl) {
    redirectUrl = url.parse(query.originalUrl).path;
  } else if (!redirectUrl && headers && headers.referer) {
    const parsedReferrer = url.parse(headers.referer);
    redirectUrl = parsedReferrer.path;
  }

  // Make sure redirectUrl is a a relative path. url.parse will accept any
  // string and return it back as the path. path will be null when parsing empty string
  if (redirectUrl && redirectUrl[0] === '/') {
    if (redirectUrl.indexOf('/login') === 0 ||
        redirectUrl.indexOf('/register') === 0) {
      return '/';
    }
    return redirectUrl;
  }
}

// The main entry point to this file is the routes function.
function routes(app) {
  const router = app.router;

  function * defaultLayout(next) {
    this.layout = Layout;
    yield next;
  }

  function * loadData (next) {
    if (
      this.url.indexOf('/robots') === 0 ||
      this.url.indexOf('/logout') === 0 ||
      this.url.indexOf('/login') === 0 ||
      this.url.indexOf('/register') === 0 ||
      this.url.indexOf('/oauth2') === 0 ||
      this.url.indexOf('/timings') === 0 ||
      this.url.indexOf('/goto') === 0 ||
      this.url.indexOf('/health') === 0
    ) {
      return yield next;
    }

    getSubreddit(this, app);
    userData(this, app);
    return yield next;
  }

  router.get('health', '/health', function * () {
    this.body = 'OK';
    return;
  });

  router.use(function * (next) {
    buildProps(this, app);
    yield next;
  });

  router.use(loadData);
  router.use(defaultLayout);
  router.use(globalMessage);

  function listingTime(query, sort) {
    if (sort === SORTS.TOP || sort === SORTS.CONTROVERSIAL) {
      return query.time || SORTS.PAST_DAY;
    }
  }

  function *indexPage () {
    const props = this.props;
    const sort = this.query.sort || SORTS.HOT;
    const time = listingTime(this.query, sort);

    this.preServerRender = function indexPagePreRender() {
      // If we're on a next/prev for an invalid thing_id, so that no results are
      // sent back, we have a stale cache. Redirect back to the first page of
      // the sub, multi, or other.
      if (IndexPage.isStalePage(this.query, this.props.dataCache.listings)) {
        app.setNotification(this.cookies, 'stalePage');
        this.redirect(IndexPage.stalePageRedirectUrl(this.path, this.query));
        return false;
      }
    };

    Object.assign(this.props, {
      sort,
      time,
      multi: this.params.multi,
      multiUser: this.params.user,
      after: this.query.after,
      before: this.query.before,
      page: parseInt(this.query.page) || 0,
    });


    if (this.props.multi) {
      props.title = `m/${props.multi}`;
      props.metaDescription = `u/${props.multiUser}'s m/${props.multi} multireddit at reddit.com`;
      props.topNavLink = `/u/${props.multiUser}/m/${props.multi}`;
    }

    const listingOpts = buildAPIOptions(this, {
      query: {
        after: props.after,
        before: props.before,
        multi: props.multi,
        multiUser: props.multiUser,
        subredditName: props.subredditName,
        sort: props.sort,
        t: props.time,
      },
    });

    setData(this, 'listings', 'links', listingOpts);

    this.body = makeBody(IndexPage);
  }

  // The homepage route.
  router.get('index', '/', indexPage);

  router.get('random', `/r/:randomSubreddit(${randomSubs.join('|')})`, function *() {
    // This code is meant to be run on the server as sa.redirects works there
    // as intended. We could modify it in the future to work on the client
    const ctx = this;
    const { origin, headers } = buildAPIOptions(this);
    const endpoint = `${origin}/r/${ctx.params.randomSubreddit}`;

    const sa = makeRequest
      .head(endpoint)
      .timeout(constants.DEFAULT_API_TIMEOUT)
      .set(headers);

    if (sa.redirects) {
      sa.redirects(0);
    }
    const randomRedirectResult = sa
      .then(function() { return true; },
            function(resAndError) { return resAndError; });

    try {
      const result = yield randomRedirectResult;
      if (result && result.header && result.header.location) {
        const parsedLocation = url.parse(result.header.location);
        if (parsedLocation && parsedLocation.path) {
          // locations back from /r/myrandom include the .json extension apparently
          return this.redirect(parsedLocation.path.replace(/\.json$/, ''));
        }
      }

    } catch (e) {
      // app.error handles making an error page or redirect
      app.error(e, this, app);
      return;
    }

    this.body = app.errorPage(this);
  });

  router.get('index.subreddit', '/r/:subreddit', indexPage);
  router.get('index.multi', '/u/:user/m/:multi', indexPage);

  function *commentsPage() {
    const ctx = this;
    const props = this.props;

    Object.assign(props, {
      sort: ctx.query.sort,
      listingId: ctx.params.listingId,
      commentId: ctx.params.commentId,
    });

    const commentsOpts = buildAPIOptions(ctx, {
      linkId: ctx.params.listingId,
      sort: ctx.query.sort || 'confidence',
      query: {},
    });

    if (props.commentId) {
      commentsOpts.query.comment = props.commentId;
      commentsOpts.query.context = this.query.context || 1;
    }

    props.data.set('comments', app.api.comments.get(commentsOpts));

    const listingOpts = buildAPIOptions(ctx, {
      id: `t3_${ctx.params.listingId}`,
    });

    props.data.set('listing', app.api.links.get(listingOpts));

    // Wait until we have the experiment variant data before fetching the
    // experiment-specific requests.
    const user = props.data.get('user') || props.data.get('loggedOutUser');
    const relevantPromise = user.then(data => {
      const feature = features.withContext({
        props,
        state: {
          data: { user: data.body },
          meta: {},
          loaded: !!props.dataCache,
          finished: false,
        },
      });
      if (feature.enabled(constants.flags.VARIANT_RELEVANCY_TOP)) {
        const linkOpts = buildAPIOptions(ctx, {
          query: {
            subredditName: props.subredditName,
            sort: 'hot',
          },
        });

        return app.api.links.get(linkOpts).then(data => ({ topLinks: data.body }));
      }
      if (feature.enabled(constants.flags.VARIANT_RELEVANCY_RELATED)) {
        const subreddits = ['xboxone', 'PS4', 'pcgaming'];
        return Promise.all(subreddits.map(id =>
          app.api.subreddits.get(buildAPIOptions(ctx, {
            id,
          }))
        )).then(communities => ({ communities }));
      }

      if (feature.enabled(constants.flags.VARIANT_RELEVANCY_ENGAGING)) {
        const subreddits = ['GamePhysics', 'iama', 'gadgets'];
        return Promise.all(subreddits.map(id =>
          app.api.subreddits.get(buildAPIOptions(ctx, {
            id,
          }))
        )).then(communities => ({ communities }));
      }

      return {};
    });
    props.data.set('relevant', relevantPromise);

    this.preServerRender = function commentsPagePreRender() {
      const { listing } = this.props.dataCache;

      if (listing) {
        this.props.title = listing.title;
        this.props.metaDescription = ListingPage.buildMeta(listing);
      }
    };

    this.body = makeBody(ListingPage);
  }
  router.get('comments.permalinkActivity',
             '/r/:subreddit/comments/:listingId/comment/:commentId', commentsPage);
  router.get('comments.permalink',
             '/r/:subreddit/comments/:listingId/:listingTitle/:commentId',
             commentsPage);

  router.get('comments.title', '/comments/:listingId/:listingTitle?', commentsPage);
  router.get('comments.subreddit',
             '/r/:subreddit/comments/:listingId/:listingTitle?', commentsPage);

  router.get('subreddit.about', '/r/:subreddit/about', function *() {
    this.body = makeBody(SubredditAboutPage);
  });

  function *searchPage() {
    const ctx = this;

    const props = Object.assign(this.props, {
      subredditName: ctx.params.subreddit,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: ctx.query.sort || 'relevance',
      time: ctx.query.time || 'all',
      query: ctx.query.q,
    });

    let searchOpts = {};

    if (ctx.query.q) {
      searchOpts = buildAPIOptions(ctx, {
        query: {
          q: ctx.query.q,
          limit: 25,
          after: ctx.query.after,
          subreddit: ctx.params.subreddit,
          sort: props.sort,
          t: props.time,
          include_facets: 'off',
          type: ctx.query.type || ['sr', 'link'],
        },
      });

      this.props.data.set('search', app.api.search.get(searchOpts));
    }

    this.body = makeBody(SearchPage);
  }

  router.get('search.index', '/search', searchPage);
  router.get('search.subreddit', '/r/:subreddit/search', searchPage);

  function userProfileSubnav(active, userName) {
    const aboutActive = active === 'about' ? 'active' : false;
    const activityActive = active === 'activity' ? 'active' : false;
    const gildActive = active === 'gild' ? 'active' : false;

    return [
      <li
        className={ `TextSubNav-li ${aboutActive}` }
        key={ `about-${aboutActive.toString()}` }
      >
        <a className='TextSubNav-a' href={ `/u/${userName}` }>About</a>
      </li>,
      <li
        className={ `TextSubNav-li ${activityActive}` }
        key={ `activity-${activityActive.toString()}` }
      >
        <a
          className='TextSubNav-a'
          href={ `/u/${userName}/activity` }
        >Activity</a>
      </li>,
      <li
        className={ `TextSubNav-li ${gildActive}` }
        key={ `gild-${gildActive.toString()}` }
      >
        <a className='TextSubNav-a' href={ `/u/${userName}/gild` }>Give gold</a>
      </li>,
    ];
  }

  router.get('user.profile', '/u/:user', function *() {
    const ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.topNavLink = `/u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;

    const userOpts = buildAPIOptions(ctx, {
      user: ctx.params.user,
    });

    this.props.data.set('userProfile', app.api.users.get(userOpts));

    const subNavProps = {
      children: userProfileSubnav('about', ctx.params.user),
      userName: ctx.params.user,
    };

    this.body = makeBody([TextSubNav, subNavProps], UserProfilePage);
  });

  router.get('user.gild', '/u/:user/gild', function *() {
    const ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;
    this.props.topNavLink = `/u/${ctx.params.user}`;

    const subNavProps = {
      children: userProfileSubnav('gild', ctx.params.user),
      userName: ctx.params.user,
    };

    this.body = makeBody([TextSubNav, subNavProps], UserGildPage);
  });

  router.get('user.activity', '/u/:user/activity', function *() {
    const sort = this.query.sort || SORTS.CONFIDENCE;
    const activity = this.query.activity || 'comments';
    const ctx = this;

    Object.assign(this.props, {
      activity,
      sort,
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      title: `about u/${ctx.params.user}`,
      metaDescription: `about u/${ctx.params.user} on reddit.com`,
    });

    const props = this.props;

    const activitiesOpts = buildAPIOptions(ctx, {
      activity,
      query: {
        sort,
        after: props.after,
        before: props.before,
      },
      user: ctx.params.user,
    });

    this.props.data.set('activities', app.api.activities.get(activitiesOpts));

    const subNavProps = {
      children: userProfileSubnav('activity', ctx.params.user),
      userName: ctx.params.user,
    };

    this.body = makeBody([TextSubNav, subNavProps], UserActivityPage);
  });

  function *submitPage() {
    const { query, props } = this;

    if (query) {
      if (query.selftext) {
        props.type = 'self';
      }

      if (query.title) {
        props.postTitle = query.title;
      }

      if (query.url) {
        props.body = query.url;
      } else if (query.text) {
        props.body = query.text;
        props.type = 'self';
      }
    }

    if (!this.token) {
      let submitUrl = this.path;
      const submitQuery = querystring.stringify(query);
      submitUrl += submitQuery ? `?${submitQuery}` : '';

      return this.redirect(`/login?originalUrl=${submitUrl}`);
    }

    props.hideTopNav = true;
    this.body = makeBody(SubmitPage);
  }

  router.get('submit', '/submit', submitPage);
  router.get('submit', '/r/:subreddit/submit', submitPage);

  function *saved (hidden=false) {
    const ctx = this;
    const props = this.props;
    const sort = this.query.sort || 'hot';

    Object.assign(this.props, {
      sort,
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      title: `${props.actionName} links`,
      metaDescription: `u/${ctx.params.user}'s saved links on reddit.com`,
    });

    let saved = app.api.saved;

    if (hidden) {
      saved = app.api.hidden;
    }

    const savedOpts = buildAPIOptions(ctx, {
      query: {
        after: props.after,
        before: props.before,
        sort: props.sort,
      },
      user: props.userName,
    });

    this.props.data.set('activities', saved.get(savedOpts));

    this.body = makeBody(UserSavedPage);
  }

  router.get('saved', '/u/:user/saved', function * () {
    yield saved.call(this, false);
  });

  router.get('hidden', '/u/:user/hidden', function * () {
    yield saved.call(this, true);
  });

  router.get('static.faq', '/faq', function * () {
    this.body = makeBody(FAQPage);
  });

  router.get('user.login', '/login', function * () {
    const originalUrl = loginRegisterOriginalUrl(this.query, this.headers);

    Object.assign(this.props, this.query, {
      originalUrl,
      mode: LoginPage.modes.login,
      hideTopNav: true,
    });
    this.body = makeBody(LoginPage);
  });

  router.get('user.register', '/register', function * () {
    const originalUrl = loginRegisterOriginalUrl(this.query, this.headers);

    Object.assign(this.props, this.query, {
      originalUrl,
      mode: LoginPage.modes.register,
      hideTopNav: true,
    });
    this.body = makeBody(LoginPage);
  });

  function tryLoad (url, options) {
    const endpoint = `${options.origin}${url}.json`;

    const sa = makeRequest
      .head(endpoint)
      .set(options.headers)
      .timeout(constants.DEFAULT_API_TIMEOUT);

    // bombs in browser
    if (sa.redirects) {
      sa.redirects(0);
    }

    return sa
      .then(function(res) {
        if (!res || !res.ok) {
          throw new Error('No response');
        } else {
          return true;
        }
      });
  }

  function makeOptions(token, app) {
    let apiOptions;
    if (token) {
      apiOptions = {
        origin: app.getConfig('authAPIOrigin'),
        headers: {
          'Authorization': `bearer ${token}`,
        },
      };
    } else {
      apiOptions = {
        origin: app.getConfig('nonAuthAPIOrigin'),
      };
    }

    return app.api.buildOptions(apiOptions);
  }

  router.get('/goto', function * () {
    const token = this.token;
    let location = this.query.location.toLowerCase();
    let result;

    app.emit('goto', location);

    const options = makeOptions(token, app);

    if (this.headers['user-agent']) {
      options.headers['user-agent'] = this.headers['user-agent'];
    }

    if (location.match(/.\/.+/)) {
      if (location.indexOf('/') !== 0) {
        location = `/${location}`;
      }

      if ([0,1].indexOf(location.indexOf('u/')) !== -1) {
        location = location.replace(/u\//, 'user/');
      }
    } else {
      location = `/r/${location}`;
    }

    try {
      result = yield tryLoad(location, options);
    } catch (e) {
      console.log(e, e.stack);
    }

    if (result) {
      return this.redirect(location);
    }

    let locationQuery = this.query.location;

    if (this.query.location.indexOf('/') !== -1) {
      locationQuery = this.query.location.split('/')[1];
    }

    const query = querystring.stringify({
      q: locationQuery,
    });

    this.redirect(`/search?${query}`);
  });

  router.get('messages.compose', '/message/compose', function *() {
    if (!this.token) {
      const query = {
        originalUrl: this.url,
      };

      return this.redirect(`/login?${querystring.stringify(query)}`);
    }


    Object.assign(this.props, {
      title: 'Compose New Message',
      metaDescription: 'user messages reddit.com',
      view: 'compose',
    });

    this.body = makeBody(MessageComposePage);
  });

  router.get('messages', '/message/:view', function *() {
    if (!this.token) {
      const query = {
        originalUrl: this.url,
      };

      return this.redirect(`/login?${querystring.stringify(query)}`);
    }

    const ctx = this;

    const props = Object.assign(this.props, {
      title: 'Messages',
      view: ctx.params.view,
      metaDescription: 'user messages at reddit.com',
    });

    const listingOpts = buildAPIOptions(ctx, {
      view: props.view,
    });

    this.props.data.set('messages', app.api.messages.get(listingOpts));

    this.body = makeBody(MessagesPage);
  });

  function * wikiPage() {
    // const path = this.params.wikiPath || 'index';  //this.params[0].substr(1) || 'index';
    const { subreddit, subPath, wikiPath } = this.params;

    let path = '';
    if (subPath) {
      path = `${subPath}${wikiPath ? '/': ''}`;
    }

    if (wikiPath) {
      path += wikiPath;
    } else if (!path) {
      path = 'index';
    }

    const options = buildAPIOptions(this, {
      subreddit,
      path,
      type: subPath || 'wikiPage',
      query: {
        raw_json: 1,
      },
    });

    const wikiGet = new Promise(function(resolve, reject) {
      app.api.wiki.get(options).then(resolve, function(e) {
        // handle api crap. otherwise user gets redirected to auth if loggedout and wiki is disabled.
        if (e.status === 403) {
          e.status = 404;
        }
        reject(e);
      });
    });

    this.props.data.set('wikiPage', wikiGet);
    this.body = makeBody(WikiPage);
  }

  const regex = 'discussions|revisions|settings|pages';
  router.get('wiki', `/r/:subreddit/wiki/:subPath(${regex})/:wikiPath(.*)?`, wikiPage);
  router.get('wiki', `/wiki/:subPath(${regex})/:wikiPath(.*)?`, wikiPage);

  router.get('wiki.subreddit', '/r/:subreddit/wiki/:wikiPath(.*)?', wikiPage);
  router.get('wiki', '/wiki/:wikiPath(.*)?', wikiPage);


  router.get('404', '*', function *() {
    this.props.status = 404;
    this.body = app.errorPage(this, 404);
  });
}

export default routes;
export { buildProps };
