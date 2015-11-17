// This file maps url routes to React element changes.

import React from 'react';
import querystring from 'querystring';
import superagent from 'superagent';

import merge from 'lodash/object/merge';

// Load models from snoode (api lib) so we can post new ones.
import { models } from 'snoode';

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
import RegisterPage from './views/pages/register';
import MessagesPage from './views/pages/messages';
import MessageComposePage from './views/pages/messageCompose';
import SubmitPage from './views/pages/submit';
import constants from './constants';

import defaultConfig from './config';

const config = defaultConfig();

function setData(ctx, key, endpoint, options) {
  var api = ctx.props.app.api;

  if (ctx.props.dataCache && ctx.props.dataCache[key]) {
    api.hydrate(endpoint, options, ctx.props.dataCache[key]);
    ctx.props.data.set(key, Promise.resolve(ctx.props.dataCache[key]));
  } else {
    ctx.props.data.set(key, api[endpoint].get(options));
  }
}

function buildAPIOptions(ctx, options={}) {
  let apiOrigin = ctx.token ? 'authAPIOrigin' : 'nonAuthAPIOrigin';
  let app = ctx.props.app;

  let apiOptions = merge({
    origin: app.getConfig(apiOrigin),
    headers: {
      'user-agent': ctx.headers['user-agent'],
    },
    env: ctx.env || 'SERVER',
  }, options);

  if (ctx.token) {
    apiOptions.headers['Authorization'] = `bearer ${ctx.token}`;
  }

  if (app.config.apiPassThroughHeaders) {
    for (var h in ctx.headers) {
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
    isGoogleCrawler: ctx.isGoogleCrawler,
    token: ctx.token,
    tokenExpires: ctx.tokenExpires,
    redirect: ctx.redirect,
    env: ctx.env,
  }
}

function buildProps(ctx, app) {
  var clientConfig = {};

  for (let c in config) {
    clientConfig[c] = app.getConfig(c);
  }

  ctx.props = {
    app: app,
    title: 'reddit: the front page of the internet',
    metaDescription: 'reddit: the front page of the internet',
    data: new Map(),
    dataCache: ctx.dataCache,
    ctx: filterContextProps(ctx),
    compact: ctx.compact,
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

function getSubreddit(ctx, app) {
  let { subreddit, multi } = ctx.params;

  if (subreddit) {
    Object.assign(ctx.props, {
      subredditName: subreddit,
      topNavLink: `/r/${subreddit}`,
      title: `r/${subreddit}`,
      metaDescription: `r/${subreddit} at reddit.com`,
    });

    const fakeSubs = ['all', 'mod', 'friends', 'random', 'randnsfw', 'myrandom'];
    if (subreddit.indexOf('+') === -1 && !fakeSubs.includes(subreddit)) {

      let subredditOpts = buildAPIOptions(ctx, {
        id: subreddit.toLowerCase(),
      });

      setData(ctx, 'subreddit', 'subreddits', subredditOpts);
    }
  }
}

function userData(ctx, app) {
  let { apiOptions, data} = ctx.props;
  let { preferences, users, subreddits } = app.api;

  if (ctx.token) {
    let userOptions =  Object.assign({}, apiOptions, {
      user: 'me'
    });
    setData(ctx, 'user', 'users', userOptions);

    let prefOptions = Object.assign({}, apiOptions);
    setData(ctx, 'preferences', 'preferences', prefOptions);

    let subOptions = Object.assign({}, apiOptions, {
      query: {
        sort: 'mine/subscriber',
        sr_detail: true,
        feature: 'mobile_settings',
        limit: 250,
      },
    });
    subOptions.headers['user-agent'] = ctx.headers['user-agent'];
    setData(ctx, 'userSubscriptions', 'subreddits', subOptions);

  } else {

    let subOptions = Object.assign({}, apiOptions, {
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
    let content = Array.prototype.map.call(arguments, (comp) => {
      if (Array.isArray(comp)) {
        const [Component, propOveride] = comp;
        return <Component {...(propOveride || props)}  />;
      } else {
        const Component = comp;
        return <Component {... props}  />;
      }
    });

    return (
      <BodyLayout { ...props }>
        { content }
      </BodyLayout>
    );
  }
};


function * globalMessage(next) {
  let message = config.globalMessage ? Object.assign({}, config.globalMessage): null;
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

// The main entry point to this file is the routes function.
function routes(app) {
  let router = app.router;

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
    ){
      return yield next;
    } else {
      getSubreddit(this, app);
      userData(this, app);
      return yield next;
    }
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

  function * indexPage (next) {
    let props = this.props;
    var sort = this.query.sort || 'hot';

    Object.assign(this.props, {
      multi: this.params.multi,
      multiUser: this.params.user,
      after: this.query.after,
      before: this.query.before,
      page: parseInt(this.query.page) || 0,
      sort: sort,
      track: 'listings',
    });


    if (this.props.multi) {
      props.title = `m/${props.multi}`;
      props.metaDescription = `u/${props.multiUser}'s m/${props.multi} multireddit at reddit.com`;
      props.topNavLink = `/u/${props.multiUser}/m/${props.multi}`;
    }

    let listingOpts = buildAPIOptions(this, {
      query: {
        after: props.after,
        before: props.before,
        multi: props.multi,
        multiUser: props.multiUser,
        subredditName: props.subredditName,
        sort: props.sort,
      },
    });

    setData(this, 'listings', 'links', listingOpts);

    this.body = makeBody(IndexPage);
  }

  // The homepage route.
  router.get('index', '/', indexPage);

  router.get('index.subreddit', '/r/:subreddit', indexPage);
  router.get('index.multi', '/u/:user/m/:multi', indexPage);

  function * commentsPage(next) {
    var ctx = this;
    var props = this.props;

    Object.assign(props, {
      sort: ctx.query.sort,
      listingId: ctx.params.listingId,
      commentId: ctx.params.commentId,
      track: 'comments',
    });

    let commentsOpts = buildAPIOptions(ctx, {
      linkId: ctx.params.listingId,
      sort: ctx.query.sort || 'confidence',
      query: {},
    });

    if (props.commentId) {
      commentsOpts.query.comment = props.commentId;
      commentsOpts.query.context = this.query.context || 1;
    }

    props.data.set('comments', app.api.comments.get(commentsOpts));

    let listingOpts = buildAPIOptions(ctx, {
      id: 't3_' + ctx.params.listingId,
    });

    props.data.set('listing', app.api.links.get(listingOpts));

    this.body = makeBody(ListingPage);
  }

  router.get('comments.title', '/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.listingid', '/comments/:listingId', commentsPage);
  router.get('comments.permalink', '/r/:subreddit/comments/:listingId/:listingTitle/:commentId', commentsPage);
  router.get('comments.index', '/r/:subreddit/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.subreddit', '/r/:subreddit/comments/:listingId', commentsPage);

  router.get('subreddit.about', '/r/:subreddit/about', function *(next) {
    this.props.track = 'subreddit';

    this.body = makeBody(SubredditAboutPage);
  });

  function * searchPage(next) {
    var ctx = this;

    let props = Object.assign(this.props, {
      subredditName: ctx.params.subreddit,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: ctx.query.sort || 'relevance',
      time: ctx.query.time || 'all',
      query: ctx.query.q,
      track: 'search',
    });

    var searchOpts = {};

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
    var aboutActive = active === 'about' ? 'active' : false;
    var activityActive = active === 'activity' ? 'active' : false;
    var gildActive = active === 'gild' ? 'active' : false;

    return [
      <li className='TextSubNav-li' active={aboutActive} key={`about-${aboutActive.toString()}`}>
        <a className={`TextSubNav-a ${aboutActive}`} href={`/u/${userName}`}>About</a>
      </li>,
      <li className='TextSubNav-li' active={activityActive} key={`activity-${activityActive.toString()}`}>
        <a className={`TextSubNav-a ${activityActive}`} href={`/u/${userName}/activity`}>Activity</a>
      </li>,
      <li className='TextSubNav-li' active={gildActive} key={`gild-${gildActive.toString()}`}>
        <a className={`TextSubNav-a ${gildActive}`} href={`/u/${userName}/gild`}>Give gold</a>
      </li>,
    ];
  }

  router.get('user.profile', '/u/:user', function *(next) {
    var ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;
    this.props.track = 'userProfile';

    let userOpts = buildAPIOptions(ctx, {
      user: ctx.params.user,
    });

    this.props.data.set('userProfile', app.api.users.get(userOpts));

    let subNavProps = {
      children: userProfileSubnav('about', ctx.params.user)
    };

    this.body = makeBody([TextSubNav, subNavProps], UserProfilePage);
  });

  router.get('user.gild', '/u/:user/gild', function *(next) {
    var ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;
    this.props.topNavLink = `/u/${ctx.params.user}`;
    this.props.track = 'gild';

    let subNavProps = {
      children: userProfileSubnav('gild', ctx.params.user)
    };

    this.body = makeBody([TextSubNav, subNavProps], UserGildPage);
  });

  router.get('user.activity', '/u/:user/activity', function *(next) {
    var sort = this.query.sort || 'hot';
    var activity = this.query.activity || 'comments';

    var ctx = this;

    Object.assign(this.props, {
      activity: activity,
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
      title: `about u/${ctx.params.user}`,
      metaDescription: `about u/${ctx.params.user} on reddit.com`,
      track: 'activity',
    });

    let props = this.props;

    let activitiesOpts = buildAPIOptions(ctx, {
      query: {
        after: props.after,
        before: props.before,
        sort: sort,
      },
      activity: activity,
      user: ctx.params.user,
    });

    this.props.data.set('activities', app.api.activities.get(activitiesOpts));

    let subNavProps = {
      children: userProfileSubnav('activity', ctx.params.user)
    };

    this.body = makeBody([TextSubNav, subNavProps], UserActivityPage);
  });

  function * submitPage(next) {
    let { query, props } = this;

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
      let submitQuery = querystring.stringify(query);
      submitUrl += submitQuery ? `?${submitQuery}` : '';

      return this.redirect('/login?originalUrl=' + submitUrl)
    }

    this.body = function(props) {
      return (
        <SubmitPage key={ this.key } {...props}/>
      );
    }
  }

  router.get('submit', '/submit', submitPage);
  router.get('submit', '/r/:subreddit/submit', submitPage);

  function * saved (hidden=false) {
    let ctx = this;
    let props = this.props;
    let sort = this.query.sort || 'hot';

    Object.assign(this.props, {
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
      title: `${props.actionName} links`,
      metaDescription: `u/${ctx.params.user}'s saved links on reddit.com`,
      track: 'activities',
    });

    let saved = app.api.saved;

    if (hidden) {
      saved = app.api.hidden;
    }

    let savedOpts = buildAPIOptions(ctx, {
      query: {
        after: props.after,
        before: props.before,
        sort: props.sort,
      },
      user: props.userName,
    });

    this.props.data.set('activities', saved.get(savedOpts))

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
    this.props.error = this.query.error;
    this.body = makeBody(LoginPage);
  });

  router.get('user.register', '/register', function * () {
    this.body = makeBody(RegisterPage);
  });

  function tryLoad (url, options) {
    var endpoint = options.origin + url + '.json';

    return new Promise(function(resolve, reject) {
      try {
        let sa = superagent
                  .head(endpoint)
                  .set(options.headers)
                  .timeout(constants.DEFAULT_API_TIMEOUT);

        // bombs in browser
        if (sa.redirects) {
          sa.redirects(0);
        }

        sa.end(function(err, res) {
          if (err || !res || !res.ok) {
            resolve();
          } else {
            resolve(true);
          }
        });
      } catch (e) {
        console.log(e, e.stack);
      }
    });
  }

  router.get('/goto', function * () {
    let location = this.query.location.toLowerCase();
    let token = this.token;
    let apiOptions;
    let result;

    app.emit('goto', location);

    if (token) {
      apiOptions =  {
        origin: app.getConfig('authAPIOrigin'),
        headers: {
          'Authorization': `bearer ${token}`,
        }
      };
    } else {
      apiOptions =  {
        origin: app.getConfig('nonAuthAPIOrigin'),
      };
    }

    let options = app.api.buildOptions(apiOptions);

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

    var query = querystring.stringify({
      q: locationQuery,
    });

    this.redirect(`/search?${query}`);
  });

  router.get('messages.compose', '/message/compose', function *(next) {
    if (!this.token) {
      let query = {
        originalUrl: this.url,
      }

      return this.redirect('/login?' + querystring.stringify(query));
    }

    var page;
    var ctx = this;

    Object.assign(this.props, {
      title: 'Compose New Message',
      metaDescription: 'user messages reddit.com',
      view: 'compose',
    });

    this.body = makeBody(MessageComposePage);
  });

  router.get('messages', '/message/:view', function *(next) {
    if (!this.token) {
      let query = {
        originalUrl: this.url,
      }

      return this.redirect('/login?' + querystring.stringify(query));
    }

    var page;
    var ctx = this;

    let props = Object.assign(this.props, {
      title: 'Messages',
      view: ctx.params.view,
      metaDescription: 'user messages at reddit.com',
      track: 'messages'
    });

    let listingOpts = buildAPIOptions(ctx, {
      view: props.view,
    });

    this.props.data.set('messages', app.api.messages.get(listingOpts));

    this.body = makeBody(MessagesPage);
  });

  router.get('404', '*', function *(next) {
    this.props.status = 404;
    this.body = app.errorPage(this, 404);
  });
}

export default routes;
export var buildProps = buildProps;
