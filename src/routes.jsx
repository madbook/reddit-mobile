// This file maps url routes to React element changes.

import React from 'react';
import globals from './globals';
import q from 'q';
import querystring from 'querystring';
import { stringify } from 'querystring';
import superagent from 'superagent';

// Load models from snoode (api lib) so we can post new ones.
import { models } from 'snoode';

// Load up the main react elements. Because of the way we define mutators, we
// need to use factories that take an app instance (with registered mutators)
// instead of requiring the elements directly. Womp womp
import IndexPage from './views/pages/index';
import ListingPage from './views/pages/listing';
import SubredditAboutPage from './views/pages/subredditAbout';
import SearchPage from './views/pages/search';
import UserProfilePage from './views/pages/userProfile';
import UserGildPage from './views/pages/userGild';
import UserActivityPage from './views/pages/userActivity';
import UserSavedPage from './views/pages/userSaved';
import ErrorPage from './views/pages/error';
import FAQPage from './views/pages/faq';
import LoginPage from './views/pages/login';
import RegisterPage from './views/pages/register';
import MessagesPage from './views/pages/messages';
import MessageComposePage from './views/pages/messageCompose';
import Layout from './views/layouts/DefaultLayout';
import BodyLayout from './views/layouts/BodyLayout';
import TextSubNav from './views/components/TextSubNav';
import MessageNav from './views/components/MessageNav';
import SubmitPage from './views/pages/submit';

// The main entry point to this file is the routes function. It will call the
// React factories to get at the mutated react elements, and map routes.
function routes(app) {
  let router = app.router;

  function formatSubreddit(s) {
    return {
      icon: s.icon,
      display_name: s.display_name,
      url: s.url,
      submit_text: s.submit_text,
    };
  }

  function loadUserSubscriptions (app, ctx, token, apiOptions) {
    if (app.getState && app.getState('subscriptions')) {
      return new Promise(function(resolve) {
        resolve(app.getState('subscriptions'));
      });
    } else {
      return new Promise(function(resolve, reject) {
        var sort = 'default';

        if (token) {
          sort = 'mine/subscriber';
        }

        var options = app.api.buildOptions(apiOptions);

        options.headers['user-agent'] = ctx.headers['user-agent'];

        options.query.sort = sort;
        options.query.sr_detail = true;
        options.query.feature = 'mobile_settings';
        options.query.limit = 250;

        try {
          app.api.subreddits.get(options).then(function(subreddits) {
            if (subreddits.data.length > 0) {
              resolve(subreddits.data.map(formatSubreddit));
            } else {
              loadUserSubscriptions(app, ctx).then(function(data) {
                resolve(data);
              });
            }
          }, function(error) {
            reject(error);
          });
        } catch (e) {
          reject(e);
        }
      });
    }
  }

  function loadUserData (app, ctx, token, apiOptions) {
    if (token) {
      if (app.getState && app.getState('user')) {
        return new Promise(function(resolve) {
          resolve(app.getState('user'));
        });
      } else {
        return new Promise(function(resolve, reject) {

          var options = app.api.buildOptions(apiOptions);
          options.user = 'me';

          try {
            app.api.users.get(options).then(function(user) {
              resolve(user.data);
            }, function(error) {
              reject(error);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    } else {
      return noop();
    }
  }

  function loadUserPrefs (app, ctx, token, apiOptions) {
    if (token) {
      if (app.getState && app.getState('prefs')) {
        return new Promise(function(resolve) {
          resolve(app.getState('prefs'));
        });
      } else {
        return new Promise(function(resolve, reject) {

          var options = app.api.buildOptions(apiOptions);

          try {
            app.api.preferences.get(options).then(function(prefs) {
              resolve(prefs.data);
            }, function(error) {
              reject(error);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    } else {
      return noop();
    }
  }

  function populateData(app, ctx, token, apiOptions, promises=[]) {
    promises.push(loadUserData(app, ctx, token, apiOptions));
    promises.push(loadUserPrefs(app, ctx, token, apiOptions));
    promises.push(loadUserSubscriptions(app, ctx, token, apiOptions));

    return new Promise(function(resolve, reject) {
      q.allSettled(promises).then(function(results) {
        var data = [];

        results.forEach(function(result) {
          if (result.state === 'fulfilled') {
            data.push(result.value);
          } else {
            reject(result.reason);
          }
        });

        resolve(data);
      }, function(error) {
        reject(error);
      });
    });
  }

  function noop() {
    return new Promise(function(resolve) {
      resolve(undefined);
    });
  }

  // Build all the standard properties used to render layouts. This may move
  // higher up (into reddit-mobile) at some point.
  function buildProps(ctx, props) {
    var defaultProps = {
      title: 'reddit: the front page of the internet',
      metaDescription: 'reddit: the front page of the internet',
      liveReload: app.getConfig('liveReload') === 'true',
      https: app.getConfig('https'),
      httpsProxy: app.getConfig('httpsProxy'),
      env: app.getConfig('env'),
      reddit: app.getConfig('reddit'),
      nonAuthAPIOrigin: app.getConfig('nonAuthAPIOrigin'),
      authAPIOrigin: app.getConfig('authAPIOrigin'),
      minifyAssets: app.getConfig('minifyAssets'),
      manifest: app.getConfig('manifest'),
      assetPath: app.getConfig('assetPath'),
      loginPath: app.getConfig('loginPath'),
      adsPath: app.getConfig('adsPath'),
      origin: app.getConfig('origin'),
      propertyId: app.getConfig('googleAnalyticsId'),
      userAgent: ctx.userAgent,
      csrf: ctx.csrf,
      compact: ctx.compact ? ctx.compact.toString() === 'true' : false,
      experiments: ctx.experiments,
      query: ctx.query,
      params: ctx.params,
      url: ctx.path,
      referrer: ctx.headers.referer,
      isGoogleCrawler: ctx.isGoogleCrawler,
      apiOptions: {
        useCache: ctx.useCache,
        origin: app.getConfig('nonAuthAPIOrigin'),
        headers: {
          'user-agent': ctx.headers['user-agent'],
        }
      },
    };

    props = Object.assign({}, defaultProps, props, ctx.props);
    props.app = app;
    props.api = app.api;
    globals().api = app.api;
    globals().compact = props.compact;
    globals().url = props.url;
    if (props.subredditName) {
      globals().loginPath = props.loginPath + '/?' + querystring.stringify({
        originalUrl: props.url,
      });
    } else {
      globals().loginPath = props.loginPath;
    }
    globals().experiments = props.experiments;
    globals().reddit = props.reddit;

    if (ctx.token) {
      props.token = ctx.token;
      props.tokenExpires = ctx.tokenExpires;
      props.apiOptions.origin = app.getConfig('authAPIOrigin');
      props.apiOptions.headers['Authorization'] = `bearer ${props.token}`;
    } else {
      props.loid = ctx.loid;
      props.loidcreated = ctx.loidcreated;
    }

    props.apiOptions = globals().api.buildOptions(props.apiOptions);

    if (app.config.apiPassThroughHeaders) {
      for (var h in ctx.headers) {
        if (app.config.apiPassThroughHeaders.indexOf(h) > -1) {
          props.apiOptions.headers[h] = ctx.headers[h];
        }
      }
    }

    if (ctx.route.name) {
      props.actionName = ctx.route.name;
    }

    return props;
  }

  router.get('health', '/health', function * () {
    this.body = 'OK';
  });

  function * indexPage (next) {
    var page;
    var sort = this.query.sort || 'hot';
    var ctx = this;

    var props = buildProps(ctx, {
      subredditName: ctx.params.subreddit,
      multi: ctx.params.multi,
      multiUser: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
    });

    if (ctx.params.multi) {
      props.title = `m/${ctx.params.multi}`;
      props.metaDescription = `u/${ctx.params.user}'s m/${ctx.params.multi} multireddit at reddit.com`;
    } else if (ctx.params.subreddit) {
      props.title = `r/${ctx.params.subreddit}`;
      props.metaDescription = `r/${ctx.params.subreddit} at reddit.com`;
    }

    var promises = [
      IndexPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    if (props.subredditName &&
      props.subredditName.indexOf('+') === -1 &&
      props.subredditName !== 'all') {

      promises.push(
        SubredditAboutPage.populateData(globals().api, props, this.renderSynchronous, false)
      );

    } else {
      promises.push(noop());
    }

    var [data, subredditData, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;

    props.subredditId = ((subredditData || {}).data || {}).name;
    props.userIsSubscribed =  ((subredditData || {}).data || {}).user_is_subscriber;

    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    try {
      var key = 'index-' + (this.params.subreddit || '') + stringify(this.query);
      page = (
        <BodyLayout {...props}>
          <IndexPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  }

  // The homepage route.
  router.get('index', '/', indexPage);

  router.get('index.subreddit', '/r/:subreddit', indexPage);
  router.get('index.multi', '/u/:user/m/:multi', indexPage);

  router.get('subreddit.about', '/r/:subreddit/about', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
    });

    var promises = [
      SubredditAboutPage.populateData(globals().api, props, this.renderSynchronous, false),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    Object.assign(props, {
      subredditId: ((data || {}).data || {}).name,
      userIsSubscribed: ((data || {}).data || {}).user_is_subscriber,
      data: data,
      title: `about r/${ctx.params.subreddit}`,
      metaDescription: `about r/${ctx.params.subreddit} at reddit.com`,
    });

    var key = `subreddit-about-${props.subredditName}`;

    try {
      page = (
        <BodyLayout {...props}>
          <SubredditAboutPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  function * searchPage(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: ctx.query.sort || 'relevance',
      time: ctx.query.time || 'all',
    });

    var promises = [];

    if (props.query) {
      promises.push(
        SearchPage.populateData(globals().api, props, this.renderSynchronous, this.useCache)
      );
    }

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    try {
      var key = 'search-results'; // <-- don't make it dynamic if you want input element doesn't get re-rendered
      page = (
        <BodyLayout {...props}>
          <SearchPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  }

  router.get('search.index', '/search', searchPage);
  router.get('search.subreddit', '/r/:subreddit/search', searchPage);

  function * commentsPage(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
      sort: ctx.query.sort,
      listingId: ctx.params.listingId,
      commentId: ctx.params.commentId,
    });

    var promises = [
      ListingPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    if (data && data.data) {
      let listing = data.data.listing;
      props.title = listing.title;
      props.metaDescription = `${listing.title} : ${listing.score} points and ${listing.num_comments} at reddit.com`;
    }

    var key = `listing-${props.listingId}-${props.commentId || ''}${stringify(this.query)}`;

    try {
      page = (
        <BodyLayout {...props}>
          <ListingPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  }


  router.get('comments.title', '/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.listingid', '/comments/:listingId', commentsPage);
  router.get('comments.permalink', '/r/:subreddit/comments/:listingId/:listingTitle/:commentId', commentsPage);
  router.get('comments.index', '/r/:subreddit/comments/:listingId/:listingTitle', commentsPage);
  router.get('comments.subreddit', '/r/:subreddit/comments/:listingId', commentsPage);

  router.get('user.profile', '/u/:user', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      userName: ctx.params.user,
      title: `about u/${ctx.params.user}`,
      metaDescription: `about u/${ctx.params.user} on reddit.com`,
    });

    var promises = [
      UserProfilePage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    var key = `user-profile-${ctx.params.user}`;

    try {
      page = (
        <BodyLayout {...props}>
          <TextSubNav>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserProfilePage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('submit', '/submit', function *(next) {
    var page;
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

      return ctx.redirect('/login?originalUrl=%2Fsubmit' + subreddit);
    }

    var props = buildProps(this, {
      subredditName: sub,
    });

    var promises = [
    ];

    var [user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);

    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    try {
      page = (
        <SubmitPage {...props}/>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('user.gild', '/u/:user/gild', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      userName: ctx.params.user,
    });

    var promises = [
      UserGildPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;

    Object.assign(props, {
      data: data,
      user: user,
      prefs: prefs,
      subscriptions: subscriptions,
      title: `about u/${ctx.params.user}`,
      metaDescription: `about u/${ctx.params.user} on reddit.com`,
    });

    var key = `user-gild-${ctx.params.user}`;

    try {
      page = (
        <BodyLayout {...props}>
          <TextSubNav>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserGildPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('user.activity', '/u/:user/activity', function *(next) {
    var page;
    var sort = this.query.sort || 'hot';
    var activity = this.query.activity || 'comments';

    var ctx = this;

    var props = buildProps(ctx, {
      activity: activity,
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
    });

    var promises = [
      UserActivityPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);

    Object.assign(props, {
      data: data,
      user: user,
      prefs: prefs,
      subscriptions: subscriptions,
      title: `about u/${ctx.params.user}`,
      metaDescription: `about u/${ctx.params.user} on reddit.com`,
    });

    try {
      var key = 'index-' + (this.params.subreddit || '') + stringify(this.query);
      page = (
        <BodyLayout {...props}>
          <TextSubNav>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserActivityPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  function * saved (hidden=false) {
    var page;
    var sort = this.query.sort || 'hot';

    var ctx = this;
    var savedText = 'saved';

    if (hidden) {
      savedText = 'hidden';
    }

    var props = buildProps(ctx, {
      userName: ctx.params.user,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: sort,
      hidden: hidden,
    });

    var promises = [
      UserSavedPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);

    Object.assign(props, {
      data: data,
      user: user,
      subscriptions: subscriptions,
      title: `${savedText} links`,
      metaDescription: `u/${user}'s saved links on reddit.com`,
    });

    try {
      var key = 'saved-' + hidden.toString() + stringify(this.query);

      page = (
        <BodyLayout {...props}>
          <UserSavedPage {...props} key={ key }/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  }

  router.get('saved', '/u/:user/saved', function * () {
    yield saved.call(this, false);
  });

  router.get('hidden', '/u/:user/hidden', function * () {
    yield saved.call(this, true);
  });

  router.get('static.faq', '/faq', function * () {
    var ctx = this;
    var page;

    var props = buildProps(this, {
      referrer: ctx.headers.referer === ctx.path ? '/' : ctx.headers.referer,
    });

    try {
      page = (
        <BodyLayout {...props}>
          <FAQPage {...props}/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('user.login', '/login', function * () {
    var ctx = this;
    var page;

    var props = buildProps(this, {
      error: ctx.query.error,
    });

    try {
      page = (
        <BodyLayout {...props}>
          <LoginPage {...props}/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('user.register', '/register', function * () {
    var ctx = this;
    var page;

    var props = buildProps(this, {
      error: ctx.query.error,
      message: ctx.query.message,
    });

    try {
      page = (
        <BodyLayout {...props}>
          <RegisterPage {...props}/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  var errorMsgMap = {
    '404': 'Sorry, that page doesn\'t seem to exist.',
    '403': 'Sorry, you don\'t have access to this.',
    'default': 'Oops, looks like something went wrong.',
  };

  router.get('static.error', /^\/([45]\d\d)$/, function * () {
    var ctx = this;
    var page;
    var statusCode = ctx.captures[0];
    var statusMsg = errorMsgMap[statusCode] || errorMsgMap['default'];
    ctx.status = parseInt(statusCode);

    var props = buildProps(this, {
      title: `${statusCode} - ${statusMsg}`,
      status: ctx.status,
      originalUrl: ctx.originalUrl || '/',
    });

    try {
      page = (
        <BodyLayout {...props}>
          <ErrorPage {...props}/>
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
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
      };

      return this.redirect('/login?' + querystring.stringify(query));
    }

    var page;
    var ctx = this;

    var props = buildProps(this, {
      title: `Compose New Message`,
      metaDescription: `user messages reddit.com`,
    });

    var [user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions);
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    var key = `user-messages-compose`;

    try {
      page = (
        <BodyLayout {...props} app={app}>
          <MessageNav user={ props.user } view='compose' />
          <MessageComposePage {...props} key={ key } app={app} />
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  router.get('messages', '/message/:view', function *(next) {
    if (!this.token) {
      let query = {
        originalUrl: this.url,
      };

      return this.redirect('/login?' + querystring.stringify(query));
    }

    var page;
    var ctx = this;

    var props = buildProps(this, {
      title: `Messages`,
      view: ctx.params.view,
      metaDescription: `user messages reddit.com`,
    });

    var promises = [
      MessagesPage.populateData(globals().api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, props.apiOptions, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    var key = `user-messages-${ctx.params.view}`;

    try {
      page = (
        <BodyLayout {...props} app={app}>
          <MessageNav user={ props.user } view={ props.view } />
          <MessagesPage {...props} key={ key } app={app} />
        </BodyLayout>
      );
    } catch (e) {
      return app.error(e, this, next);
    }

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });
}

export default routes;
