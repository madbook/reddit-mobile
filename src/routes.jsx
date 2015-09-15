// This file maps url routes to React element changes.

import React from 'react';
import querystring from 'querystring';
import superagent from 'superagent';

// Load models from snoode (api lib) so we can post new ones.
import { models } from 'snoode';

// Load up the main react elements. Because of the way we define mutators, we
// need to use factories that take an app instance (with registered mutators)
// instead of requiring the elements directly. Womp womp
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

// The main entry point to this file is the routes function. It will call the
// React factories to get at the mutated react elements, and map routes.
function routes(app) {
  let router = app.router;

  function buildAPIOptions(ctx, options={}) {
    let apiOrigin = ctx.token ? 'authAPIOrigin' : 'nonAuthAPIOrigin';

    let apiOptions = {
      origin: app.getConfig(apiOrigin),
      headers: {
        'user-agent': ctx.headers['user-agent'],
      },
      env: ctx.env || 'SERVER',
    };

    if (ctx.token) {
      apiOptions.headers['Authorization'] = `bearer ${ctx.token}`
    }

    if (app.config.apiPassThroughHeaders) {
      for (var h in ctx.headers) {
        if (app.config.apiPassThroughHeaders.indexOf(h) > -1) {
          apiOptions.headers[h] = ctx.headers[h];
        }
      }
    }

    return Object.assign(app.api.buildOptions(apiOptions), options);
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
    }
  }

  // Build all the standard properties used to render layouts. This may move
  // higher up (into reddit-mobile) at some point.
  function buildProps() {
    return function * (next) {
      var ctx = this;
      var clientConfig = {};

      for (let c in config) {
        clientConfig[c] = app.getConfig(c);
      }

      this.props = {
        app: app,
        title: 'reddit: the front page of the internet',
        metaDescription: 'reddit: the front page of the internet',
        data: new Map(),
        dataCache: ctx.dataCache,
        ctx: filterContextProps(ctx),
        compact: ctx.compact,
        experiments: ctx.experiments,
        user: ctx.user,
        token: ctx.token,
        tokenExpires: ctx.tokenExpires,
        config: clientConfig,
        render: Date.now(),
      };

      this.props.apiOptions = buildAPIOptions(this);

      yield next;
    }
  }

  function userData() {
    return function * (next) {
      if (
        this.params.error ||
        this.url.indexOf('/logout') === 0 ||
        this.url.indexOf('/login') === 0 ||
        this.url.indexOf('/register') === 0 ||
        this.url.indexOf('/oauth2') === 0 ||
        this.url.indexOf('/timings') === 0 ||
        this.url.indexOf('/goto') === 0
       ){
         yield next;
         return;
       }

      if (this.token) {
        this.props.data.set('user', app.getUser(this));
        this.props.data.set('userPrefs', app.getUserPrefs(this));
      }

      this.props.data.set('userSubscriptions', app.getUserSubscriptions(this));

      yield next;
    }
  }

  function * defaultLayout(next) {
    this.layout = Layout;
    yield next;
  }

  router.get('health', '/health', function * () {
    this.body = 'OK';
  });

  router.use(buildProps());
  router.use(userData());
  router.use(defaultLayout);

  function * indexPage (next) {
    var ctx = this;
    var sort = this.query.sort || 'hot';

    Object.assign(this.props, {
      subredditName: ctx.params.subreddit,
      multi: ctx.params.multi,
      multiUser: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
    });

    this.props.topNavTitle = this.props.subredditName;

    if (this.props.subredditName) {
      this.props.topNavLink = "/r/${props.subredditName}";
    } else if (this.props.multi) {
      this.props.topNavLink = "/u/${props.multiUser}/m/${props.multi}";
    }

    if (this.props.multi) {
      this.props.title = `m/${this.props.multi}`;
      this.props.metaDescription = `u/${this.props.multiUser}'s m/${this.props.multi} multireddit at reddit.com`;
    } else if (this.props.subredditName) {
      this.props.title = `r/${this.props.subredditName}`;
      this.props.metaDescription = `r/${this.props.subredditName} at reddit.com`;
    }

    let props = this.props;
    let listingOpts = buildAPIOptions(ctx, {
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

    if (this.props.subredditName &&
      this.props.subredditName.indexOf('+') === -1 &&
      this.props.subredditName !== 'all') {

      let subredditOpts = buildAPIOptions(ctx, {
        query: {
          subreddit: props.subredditName,
        },
      });

      setData(this, 'subreddit', 'subreddits', subredditOpts);
    }

    var key = 'index-' + (this.params.subreddit || '') + querystring.stringify(this.query);

    this.body = function(props) {
      return (
        <BodyLayout { ...props }>
          <IndexPage { ...props } key={ key }/>
        </BodyLayout>
      );
    };
  }

  // The homepage route.
  router.get('index', '/', indexPage);

  router.get('index.subreddit', '/r/:subreddit', indexPage);
  router.get('index.multi', '/u/:user/m/:multi', indexPage);

  function * commentsPage(next) {
    var ctx = this;


    Object.assign(this.props, {
      sort: ctx.query.sort,
      subredditName: ctx.params.subreddit,
      listingId: ctx.params.listingId,
      commentId: ctx.params.commentId,
    });

    let commentsOpts = buildAPIOptions(ctx, {
      linkId: ctx.params.listingId,
      sort: ctx.query.sort || 'confidence',
      query: {},
    });

    if (this.props.commentId) {
      commentsOpts.query.comment = this.props.commentId;
      commentsOpts.query.context = this.query.context || 1;
    }

    this.props.data.set('comments', app.api.comments.get(commentsOpts));

    let listingOpts = buildAPIOptions(ctx, {
      id: 't3_' + ctx.params.listingId,
    });

    this.props.data.set('listing', app.api.links.get(listingOpts));

    var key = `listing-${this.props.listingId}-${this.props.commentId || ''}${querystring.stringify(this.query)}`;

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <ListingPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
  }

  router.get('comments.title', '/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.listingid', '/comments/:listingId', commentsPage);
  router.get('comments.permalink', '/r/:subreddit/comments/:listingId/:listingTitle/:commentId', commentsPage);
  router.get('comments.index', '/r/:subreddit/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.subreddit', '/r/:subreddit/comments/:listingId', commentsPage);

  router.get('subreddit.about', '/r/:subreddit/about', function *(next) {
    var page;
    var ctx = this;

    Object.assign(this.props, {
      subredditName: ctx.params.subreddit,
      title: `about r/${ctx.params.subreddit}`,
      metaDescription: `about r/${ctx.params.subreddit} at reddit.com`,
    });

    let subredditOpts = buildAPIOptions(ctx, {
      query: {
        subreddit: ctx.params.subreddit,
      }
    });

    this.props.data.set('subreddit', app.api.subreddits.get(subredditOpts));

    this.body = function(props) {
      var key = `subreddit-about-${props.subredditName}`;

      return (
        <BodyLayout {...props}>
          <SubredditAboutPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
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

    var key = 'search-results-' + JSON.stringify(searchOpts.query || {});
    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <SearchPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
  }

  router.get('search.index', '/search', searchPage);
  router.get('search.subreddit', '/r/:subreddit/search', searchPage);

  function userProfileSubnav(active, userName) {
    var aboutActive = active === 'about' ? 'active' : false;
    var activityActive = active === 'activity' ? 'active' : false;
    var gildActive = active === 'gild' ? 'active' : false;

    return (
      <TextSubNav>
        <li className='TextSubNav-li' active={aboutActive}>
          <a className={`TextSubNav-a ${aboutActive}`} href={`/u/${userName}`}>About</a>
        </li>
        <li className='TextSubNav-li' active={activityActive}>
          <a className={`TextSubNav-a ${activityActive}`} href={`/u/${userName}/activity`}>Activity</a>
        </li>
        <li className='TextSubNav-li' active={gildActive}>
          <a className={`TextSubNav-a ${gildActive}`} href={`/u/${userName}/gild`}>Give gold</a>
        </li>
      </TextSubNav>
    );
  }

  router.get('user.profile', '/u/:user', function *(next) {
    var ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;

    let userOpts = buildAPIOptions(ctx, {
      user: ctx.params.user,
    });

    this.props.data.set('userProfile', app.api.users.get(userOpts));

    var key = `user-profile-${ctx.params.user}`;

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          { userProfileSubnav('about', ctx.params.user) }
          <UserProfilePage {...props} key={ key }/>
        </BodyLayout>
      );
    }
  });

  router.get('user.gild', '/u/:user/gild', function *(next) {
    var ctx = this;

    this.props.userName = ctx.params.user;
    this.props.title = `about u/${ctx.params.user}`;
    this.props.metaDescription = `about u/${ctx.params.user} on reddit.com`;

    this.props.topNavTitle = `u/${ctx.params.user}`;
    this.props.topNavLink = `/u/${ctx.params.user}`;

    var key = `user-gild-${ctx.params.user}`;

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          { userProfileSubnav('gild', ctx.params.user) }
          <UserGildPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
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

    var key = 'user-activity-' + ctx.params.user + '-' + querystring.stringify(this.query);

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          { userProfileSubnav('activity', ctx.params.user) }
          <UserActivityPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
  });

  router.get('submit', '/submit', function *(next) {
    var ctx = this;
    var sub;

    if (ctx.query) {
      sub = ctx.query.subreddit || '';
    }

    if (!ctx.token) {
      var subreddit = '';
      if (sub) {
        subreddit = '?subreddit=' + sub;
      }

      return ctx.redirect('/login?originalUrl=%2Fsubmit' + subreddit)
    }

    this.props.subredditName = sub;

    this.body = function(props) {
      return (
        <SubmitPage {...props}/>
      );
    }
  });

  function * saved (hidden=false) {
    var ctx = this;
    var sort = this.query.sort || 'hot';
    var savedText = 'saved';

    Object.assign(this.props, {
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
      hidden: hidden,
      title: `${savedText} links`,
      metaDescription: `u/${ctx.params.user}'s saved links on reddit.com`,
    });

    if (hidden) {
      savedText = 'hidden';
    }

    var saved = app.api.saved;

    if (hidden) {
      saved = app.api.hidden;
    }

    let props = this.props;

    let savedOpts = buildAPIOptions(ctx, {
      query: {
        after: props.after,
        before: props.before,
        sort: props.sort,
      },
      user: props.userName,
    });

    this.props.data.set('activities', saved.get(savedOpts))

    this.body = function(props) {
      var key = 'saved-' + hidden.toString() + querystring.stringify(this.query);

      return (
        <BodyLayout {...props}>
          <UserSavedPage {...props} key={ key }/>
        </BodyLayout>
      );
    }
  }

  router.get('saved', '/u/:user/saved', function * () {
    yield saved.call(this, false);
  });

  router.get('hidden', '/u/:user/hidden', function * () {
    yield saved.call(this, true);
  });

  router.get('static.faq', '/faq', function * () {
    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <FAQPage {...props}/>
        </BodyLayout>
      );
    }
  });

  router.get('user.login', '/login', function * () {
    var ctx = this;
    this.props.error = ctx.query.error;

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <LoginPage {...props}/>
        </BodyLayout>
      );
    };
  });

  router.get('user.register', '/register', function * () {
    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <RegisterPage {...props}/>
        </BodyLayout>
      );
    }
  });

  function tryLoad (url, options) {
    var endpoint = options.origin + url + '.json';

    return new Promise(function(resolve, reject) {
      try {
        let sa = superagent
                  .head(endpoint)
                  .set(options.headers);

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

    var key = `user-messages-compose`;

    this.body = function(props) {
      return (
        <BodyLayout {...props} app={app}>
          <MessageComposePage {...props} key={ key } app={app} />
        </BodyLayout>
      );
    }
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
    });

    let listingOpts = buildAPIOptions(ctx, {
      view: props.view,
    });

    this.props.data.set('messages', app.api.messages.get(listingOpts));

    var key = `user-messages-${ctx.params.view}`;

    this.body = function(props) {
      return (
        <BodyLayout {...props}>
          <MessagesPage {...props} key={ key } />
        </BodyLayout>
      );
    }
  });
}

export default routes;
