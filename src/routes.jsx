// This file maps url routes to React element changes.

import q from 'q';
import { stringify } from 'querystring';
import React from 'react';
import superagent from 'superagent';
import querystring from 'querystring';

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
import Layout from './views/layouts/DefaultLayout';
import BodyLayout from './views/layouts/BodyLayout';
import TextSubNav from './views/components/TextSubNav';
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
    }
  }

  function loadUserSubscriptions (app, ctx, token) {
    if (app.getState && app.getState('subscriptions')) {
      return new Promise(function(resolve) {
        resolve(app.getState('subscriptions'));
      });
    } else {
      return new Promise(function(resolve, reject) {
        var sort = 'default';

        if (token) {
          var apiOptions =  {
            origin: app.getConfig('authAPIOrigin'),
            headers: {
              'Authorization': `bearer ${token}`,
            }
          };

          sort = 'mine/subscriber';
        } else {
          var apiOptions =  {
            origin: app.getConfig('nonAuthAPIOrigin'),
          };
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

  function loadUserData (app, ctx, token) {
    if (token) {
      if (app.getState && app.getState('user')) {
        return new Promise(function(resolve) {
          resolve(app.getState('user'));
        });
      } else {
        return new Promise(function(resolve, reject) {
          var apiOptions =  {
            origin: app.getConfig('authAPIOrigin'),
            headers: {
              'Authorization': `bearer ${token}`,
              'user-agent': ctx.headers['user-agent'],
            }
          };

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

  function loadUserPrefs (app, ctx, token) {
    if (token) {
      if (app.getState && app.getState('prefs')) {
        return new Promise(function(resolve) {
          resolve(app.getState('prefs'));
        });
      } else {
        return new Promise(function(resolve, reject) {
          var apiOptions =  {
            origin: app.getConfig('authAPIOrigin'),
            headers: {
              'Authorization': `bearer ${token}`,
              'user-agent': ctx.headers['user-agent'],
            }
          };

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

  function populateData(app, ctx, token, promises=[]) {
    promises.push(loadUserData(app, ctx, token));
    promises.push(loadUserPrefs(app, ctx, token));
    promises.push(loadUserSubscriptions(app, ctx, token));

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

    if (ctx.token) {
      props.token = ctx.token;
      props.tokenExpires = ctx.tokenExpires;
      props.apiOptions.origin = app.getConfig('authAPIOrigin');
      props.apiOptions.headers['Authorization'] = `bearer ${props.token}`
    } else {
      props.loid = ctx.loid;
      props.loidcreated = ctx.loidcreated;
    }

    props.apiOptions = props.api.buildOptions(props.apiOptions);

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
      IndexPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    if (props.subredditName &&
      props.subredditName.indexOf('+') === -1 &&
      props.subredditName !== 'all') {

      promises.push(
        SubredditAboutPage.populateData(props.api, props, this.renderSynchronous, false)
      );

    } else {
      promises.push(noop());
    }

    var [data, subredditData, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;

    props.subredditId = ((subredditData || {}).data || {}).name;
    props.userIsSubscribed =  ((subredditData || {}).data || {}).user_is_subscriber;

    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    try {
      var key = 'index-' + (this.params.subreddit || '') + stringify(this.query);
      page = (
        <BodyLayout {...props} app={app}>
          <IndexPage {...props} key={ key } app={app}/>
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
      SubredditAboutPage.populateData(props.api, props, this.renderSynchronous, false),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
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
        <BodyLayout {...props} app={ app }>
          <SubredditAboutPage {...props} key={ key } app={ app } />
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

    var data = {};
    var promises = [];

    if (props.query) {
      promises.push(
        SearchPage.populateData(props.api, props, this.renderSynchronous, this.useCache)
      );
    }

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    try {
      var key = 'search-results'; // <-- don't make it dynamic if you want input element doesn't get re-rendered
      page = (
        <BodyLayout {...props} app={ app }>
          <SearchPage {...props} key={ key } app={ app } />
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
      ListingPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
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
        <BodyLayout {...props} app={app}>
          <ListingPage {...props} key={ key } app={app} />
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
      UserProfilePage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
    props.prefs = prefs;
    props.subscriptions = subscriptions;

    var key = `user-profile-${ctx.params.user}`;

    try {
      page = (
        <BodyLayout {...props} app={app}>
          <TextSubNav>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserProfilePage {...props} key={ key } app={app} />
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

      return ctx.redirect('/login?originalUrl=%2Fsubmit' + subreddit)
    }

    var props = buildProps(this, {
      subredditName: sub,
    });

    var promises = [
    ];

    var [user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.user = user;
    props.subscriptions = subscriptions;

    try {
      page = (
        <SubmitPage {...props} app={app} />
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
      UserGildPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
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
        <BodyLayout {...props} app={app}>
          <TextSubNav>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserGildPage {...props} key={ key } app={app} />
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
      UserActivityPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);

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
        <BodyLayout {...props} app={app}>
          <TextSubNav>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}`}>About</a></li>
            <li className='TextSubNav-li' active={true}><a className='TextSubNav-a active' href={`/u/${props.userName}/activity`}>Activity</a></li>
            <li className='TextSubNav-li'><a className='TextSubNav-a' href={`/u/${props.userName}/gild`}>Give gold</a></li>
          </TextSubNav>
          <UserActivityPage {...props} key={ key } app={app}/>
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
      UserSavedPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, prefs, subscriptions] = yield populateData(app, ctx, ctx.token, promises);

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
        <BodyLayout {...props} app={app}>
          <UserSavedPage {...props} key={ key } app={app}/>
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

    var props = buildProps(this, {
      referrer: ctx.headers.referer === ctx.path ? '/' : ctx.headers.referer,
    });

    try {
      var page = (
        <BodyLayout {...props} app={app}>
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

    var props = buildProps(this, {
      error: ctx.query.error,
    });

    try {
      var page = (
        <BodyLayout {...props} app={app}>
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

    var props = buildProps(this, {
      error: ctx.query.error,
      message: ctx.query.message,
    });

    try {
      var page = (
        <BodyLayout {...props} app={app}>
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
    var statusCode = ctx.captures[0];
    var statusMsg = errorMsgMap[statusCode] || errorMsgMap['default'];
    ctx.status = parseInt(statusCode);

    var props = buildProps(this, {
      referrer: ctx.headers.referer === ctx.path ? '/' : ctx.headers.referer,
      title: `${statusCode} - ${statusMsg}`,
      status: ctx.status,
      originalUrl: decodeURIComponent(ctx.query.originalUrl) || '/',
    });

    if (statusCode.match(/^5.*/) && app.getConfig('debug')) {
      props.error = ctx.error;
    }

    try {
      var page = (
        <BodyLayout {...props} app={app}>
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
}

export default routes;
