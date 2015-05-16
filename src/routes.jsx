// This file maps url routes to React element changes.

import q from 'q';
import { stringify } from 'querystring';
import React from 'react';

// Load models from snoode (api lib) so we can post new ones.
import { models } from 'snoode';

// Load up the main react elements. Because of the way we define mutators, we
// need to use factories that take an app instance (with registered mutators)
// instead of requiring the elements directly. Womp womp
import IndexPageFactory from './views/pages/index';
var IndexPage;

import ListingPageFactory from './views/pages/listing';
var ListingPage;

import SubredditAboutPageFactory from './views/pages/subredditAbout';
var SubredditAboutPage;

import SearchPageFactory from './views/pages/search';
var SearchPage;

import UserProfilePageFactory from './views/pages/userProfile';
var UserProfilePage;

import UserGildPageFactory from './views/pages/userGild';
var UserGildPage;

import UserActivityPageFactory from './views/pages/userActivity';
var UserActivityPage;

import ErrorPageFactory from './views/pages/error';
var ErrorPage;

import FAQPageFactory from './views/pages/faq';
var FAQPage;

import LoginPageFactory from './views/pages/login';
var LoginPage;

import RegisterPageFactory from './views/pages/register';
var RegisterPage;

import LayoutFactory from './views/layouts/DefaultLayout';
var Layout;

import BodyLayoutFactory from './views/layouts/BodyLayout';
var BodyLayout;

import TextSubNavFactory from './views/components/TextSubNav';
var TextSubNav;

// The main entry point to this file is the routes function. It will call the
// React factories to get at the mutated react elements, and map routes.
function routes(app) {
  IndexPage = IndexPageFactory(app);
  ListingPage = ListingPageFactory(app);
  SubredditAboutPage = SubredditAboutPageFactory(app);
  SearchPage = SearchPageFactory(app);
  UserProfilePage = UserProfilePageFactory(app);
  UserGildPage = UserGildPageFactory(app);
  UserActivityPage = UserActivityPageFactory(app);
  ErrorPage = ErrorPageFactory(app);
  FAQPage = FAQPageFactory(app);
  LoginPage = LoginPageFactory(app);
  RegisterPage = RegisterPageFactory(app);
  Layout = LayoutFactory(app);
  BodyLayout = BodyLayoutFactory(app);
  TextSubNav = TextSubNavFactory(app);

  function formatSubreddit(s) {
    return {
      icon: s.icon,
      display_name: s.display_name,
      url: s.url,
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

  function populateData(app, ctx, token, promises=[]) {
    promises.push(loadUserData(app, ctx, token));
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
      minifyAssets: app.getConfig('minifyAssets'),
      manifest: app.getConfig('manifest'),
      assetPath: app.getConfig('assetPath'),
      loginPath: app.getConfig('loginPath'),
      loidcreated: ctx.loidcreated,
      showBetaBanner: ctx.showBetaBanner,
      userAgent: ctx.userAgent,
      csrf: ctx.csrf,
      compact: ctx.compact ? ctx.compact.toString() === 'true' : false,
      query: ctx.query,
      params: ctx.params,
      url: ctx.path,
      renderTracking: app.getConfig('renderTracking'),
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
    props.loid = ctx.loid;

    if (ctx.token) {
      props.token = ctx.token;
      props.tokenExpires = ctx.tokenExpires;
      props.apiOptions.origin = app.getConfig('authAPIOrigin');
      props.apiOptions.headers['Authorization'] = `bearer ${props.token}`
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

  app.router.get('health', '/health', function * () {
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

    var [data, subredditData, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;

    props.subredditId = ((subredditData || {}).data || {}).name;
    props.userIsSubscribed =  ((subredditData || {}).data || {}).user_is_subscriber;

    props.user = user;
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
  app.router.get('index', '/', indexPage);

  app.router.get('index.subreddit', '/r/:subreddit', indexPage);
  app.router.get('index.multi', '/u/:user/m/:multi', indexPage);

  app.router.get('subreddit.about', '/r/:subreddit/about', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
    });

    var promises = [
      SubredditAboutPage.populateData(props.api, props, this.renderSynchronous, false),
    ];

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
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

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
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

  app.router.get('search.index', '/search', searchPage);
  app.router.get('search.subreddit', '/r/:subreddit/search', searchPage);

  function * commentsPage(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
      sort: ctx.query.sort,
      listingId: ctx.params.listingId,
    });

    var promises = [
      ListingPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
    props.subscriptions = subscriptions;

    if (data && data.data) {
      let listing = data.data.listing;
      props.title = listing.title;
      props.metaDescription = `${listing.title} : ${listing.score} points and ${listing.num_comments} at reddit.com`;
    }

    var key = `listing-${props.listingId}-${stringify(this.query)}`;

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

  app.router.get('comments.listingid', '/comments/:listingId', commentsPage);
  app.router.get('comments.title', '/comments/:listingId/:listingTitle', commentsPage);
  app.router.get('comments.subreddit', '/r/:subreddit/comments/:listingId', commentsPage);
  app.router.get('comments.index', '/r/:subreddit/comments/:listingId/:listingTitle', commentsPage);

  app.router.get('user.profile', '/u/:user', function *(next) {
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

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;
    props.user = user;
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

  app.router.get('user.gild', '/u/:user/gild', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      userName: ctx.params.user,
    });

    var promises = [
      UserGildPage.populateData(props.api, props, this.renderSynchronous, this.useCache),
    ];

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);
    props.data = data;

    Object.assign(props, {
      data: data,
      user: user,
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

  app.router.get('user.activity', '/u/:user/activity', function *(next) {
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

    var [data, user, subscriptions] = yield populateData(app, ctx, ctx.token, promises);

    Object.assign(props, {
      data: data,
      user: user,
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

  app.router.get('static.faq', '/faq', function * () {
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

  app.router.get('user.login', '/login', function * () {
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

  app.router.get('user.register', '/register', function * () {
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

  app.router.get('static.error', /\/([45]\d\d)/, function * () {
    var ctx = this;
    var statusCode = ctx.captures[0];
    var statusMsg = errorMsgMap[statusCode] || errorMsgMap['default'];
    ctx.status = parseInt(statusCode);

    var props = buildProps(this, {
      referrer: ctx.headers.referer === ctx.path ? '/' : ctx.headers.referer,
      title: `${statusCode} - ${statusMsg}`,
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

  // Server-side only!
  app.router.post('vote', '/vote/:id',
    function * () {
      var endpoints = {
        '1': 'comment',
        '3': 'listing',
      }

      var id = this.params.id;
      var endpoint = endpoints[id[1]];

      var vote = new models.Vote({
        direction: parseInt(this.query.direction),
        id: id,
      });

      if (vote.get('direction') !== undefined && vote.get('id')) {
        var options = app.api.buildOptions(props.apiOptions);
        options.model = vote;

        api.votes.post(options).done(function() {
        });
      }
    });

  app.router.post('/comment', function * () {
    var ctx = this;

    var comment = new models.Comment({
      thingId: ctx.body.thingId,
      text: ctx.body.text
    });

    if (!this.token) {
      return this.redirect(this.headers.referer || '/');
    }

    var options = app.api.buildOptions(props.apiOptions);
    options.model = comment;

    api.comments.post(options).done(function() {
      this.redirect(this.headers.referer || '/');
    });
  });
}

export default routes;
