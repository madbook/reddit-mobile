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

import UserProfileNavFactory from './views/components/UserProfileNav';
var UserProfileNav;

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
  UserProfileNav = UserProfileNavFactory(app);

  // Build all the standard properties used to render layouts. This may move
  // higher up (into reddit-mobile) at some point.
  function buildProps(ctx, props) {
    var defaultProps = {
      title: 'reddit: the front page of the internet',
      liveReload: app.getConfig('liveReload') === 'true',
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

    var props = Object.assign({}, defaultProps, ctx.props, props);

    props.app = app;
    props.api = app.api;
    props.loid = ctx.loid;

    if (ctx.token) {
      props.user = ctx.user;
      props.token = ctx.token;
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

    return props;
  }

  app.router.get('/health', function * () {
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

    var data = yield IndexPage.populateData(props.api, props, this.renderSynchronous, this.useCache);

    if (props.subredditName &&
      props.subredditName.indexOf('+') === -1 &&
      props.subredditName !== 'all') {

      var subredditData = yield SubredditAboutPage.populateData(props.api, props, this.renderSynchronous, false);
      props = Object.assign({
        subredditId: ((subredditData || {}).data || {}).name,
        userIsSubscribed: ((subredditData || {}).data || {}).user_is_subscriber,
      }, props);
    }

    props = Object.assign({
      data: data,
    }, props);

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
  app.router.get('/', indexPage);

  app.router.get('/r/:subreddit', indexPage);
  app.router.get('/u/:user/m/:multi', indexPage);

  app.router.get('/r/:subreddit/about', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
    });

    var data = yield SubredditAboutPage.populateData(props.api, props, this.renderSynchronous, false);

    props = Object.assign({
      subredditId: ((data || {}).data || {}).name,
      userIsSubscribed: ((data || {}).data || {}).user_is_subscriber,
      data: data,
    }, props);

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
      query: ctx.query.q,
      subredditName: ctx.params.subreddit,
      after: ctx.query.after,
      before: ctx.query.before,
      page: parseInt(ctx.query.page) || 0,
      sort: ctx.query.sort || 'relevance',
      time: ctx.query.time || 'all',
    });

    var data = {};
    if (props.query) {
      data = yield SearchPage.populateData(props.api, props, this.renderSynchronous, this.useCache);
    }

    props = Object.assign({
      results: data,
    }, props);

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

  app.router.get('/search', searchPage);
  app.router.get('/r/:subreddit/search', searchPage);

  app.router.get('/r/:subreddit/comments/:listingId/:listingTitle', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      subredditName: ctx.params.subreddit,
      sort: ctx.query.sort,
      listingId: ctx.params.listingId,
    });

    var data = yield ListingPage.populateData(props.api, props, this.renderSynchronous, this.useCache);

    props = Object.assign({
      data: data,
    }, props);

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
  });

  app.router.get('/u/:user', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      userName: ctx.params.user,
    });

    var data = yield UserProfilePage.populateData(props.api, props, this.renderSynchronous, this.useCache);

    props = Object.assign({
      data: data,
    }, props);

    var key = `user-profile-${ctx.params.user}`;

    try {
      page = (
        <BodyLayout {...props} app={app}>
          <UserProfileNav userName={ props.userName } profileActive={ true } />
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

  app.router.get('/u/:user/gild', function *(next) {
    var page;
    var ctx = this;

    var props = buildProps(this, {
      userName: ctx.params.user,
    });

    var data = yield UserGildPage.populateData(props.api, props, this.renderSynchronous, this.useCache);

    props = Object.assign({
      data: data,
    }, props);

    var key = `user-gild-${ctx.params.user}`;

    try {
      page = (
        <BodyLayout {...props} app={app}>
          <UserProfileNav userName={ props.userName } gildActive={ true } />
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

  app.router.get('/u/:user/activity', function *(next) {
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

    var data = yield UserActivityPage.populateData(props.api, props, this.renderSynchronous, this.useCache);

    props = Object.assign({
      data: data,
    }, props);

    try {
      var key = 'index-' + (this.params.subreddit || '') + stringify(this.query);
      page = (
        <BodyLayout {...props} app={app}>
          <UserProfileNav userName={ props.userName } activityActive={ true } />
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

  app.router.get('/faq', function * () {
    var ctx = this;

    var props = buildProps(this, {
      referrer: ctx.headers.referer,
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

  app.router.get('/login', function * () {
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

  app.router.get('/register', function * () {
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

  app.router.get('/404', function * () {
    var ctx = this;

    var props = buildProps(this, {
      referrer: ctx.headers.referer,
      title: '404 - Sorry, that page doesn\'t seem to exist.',
    });

    var page = (
      <BodyLayout {...props} app={app}>
        <ErrorPage {...props}/>
      </BodyLayout>
    );

    this.status = 404;

    this.body = page;
    this.layout = Layout;
    this.props = props;
  });

  app.router.get(/\/4\d\d/, function * () {
    var ctx = this;

    var props = buildProps(this, {
      referrer: ctx.headers.referer,
      title: '400 - Oops, looks like something went wrong.',
    });

    this.status = 400;

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

  app.router.get(/\/5\d\d/, function * () {
    var ctx = this;

    this.status = 500;

    var props = buildProps(this, {
      referrer: ctx.headers.referer,
      title: '500 - Oops, looks like something went wrong.',
    });

    if (app.getConfig('debug')) {
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
