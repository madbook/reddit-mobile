import 'babel-polyfill';
import React from 'react-dom';

import { sendTimings, onError, loadShimThenInitialize, onLoad, render } from './clientLib';

// Register as early as possible
window.onerror = onError;

import '../../src/lib/dnt';
import initBanner from '../../src/lib/initBanner';

import forOwn from 'lodash/object/forOwn';

import ClientReactApp from '@r/horse-react/src/client';
import attachFastClick from 'fastclick';
import mixin from '../../src/app-mixin';

const App = mixin(ClientReactApp);

import config from '../../src/config';
import cookies from 'cookies-js';
import setLoggedOutCookies from '../../src/lib/loid';
import routes, { buildProps } from '../../src/routes';

import trackingEvents from './trackingEvents';

import setAppMethods from './appMethods';
import setEvents from './clientEvents';
import { shouldShowBanner } from '../../src/lib/smartBannerState';
import constants from '../../src/constants';

// A few es5 sanity checks
if (!Object.create || !Array.prototype.map || !Object.freeze) {
  onLoad(loadShimThenInitialize);
} else {
  onLoad(function() {
    initialize(true);
  });
}

function initialize(bindLinks) {
  const { bootstrap } = window;
  const dataCache = bootstrap.dataCache;

  config.mountPoint = document.getElementById('app-container');

  forOwn(config, function(val, key) {
    if (bootstrap.config[key]) {
      config[key] = bootstrap.config[key];
    }
  });

  config.seed = bootstrap.seed || Math.random();

  const app = new App(config);
  routes(app);

  app.setState('referrer', document.referrer);

  app.setState('userSubscriptions', dataCache.userSubscriptions);

  if (dataCache.user) {
    app.setState('user', dataCache.user);
    app.setState('preferences', dataCache.preferences);

    cookies.set('over18', dataCache.preferences.body.over_18);
  }

  app.emitter.setMaxListeners(30);

  const history = window.history || window.location.history;

  // scrollcache is updated by app.postRender and the
  // click handler on body.
  app.scrollCache = {};

  // any calls to app.<method defined outside horse> must be done after this.
  const $body = document.body || document.getElementsByTagName('body')[0];
  setAppMethods(app, $body, render, history);

  if (app.getState('token')) {
    app.setTokenRefresh(app, app.getState('tokenExpires'));
  } else if (!cookies.get('loid')) {
    setLoggedOutCookies(cookies, app);
  }

  app.router.get('/oauth2/login', function * () {
    window.location = '/oauth2/login';
  });

  // env comes from bootstrap from the server, update now that the client is loading
  app.state.ctx.env = 'CLIENT';

  app.emitter.once('pageview', data => {
    if (!data.feature.enabled(constants.flags.SMARTBANNER)) { return; }

    const {
      show,
      impressionUrl,
      clickUrl,
    } = shouldShowBanner({
      actionName: data.actionName,
      loid: data.loid,
      userAgent: data.ctx.userAgent || '',
      data: data.data,
    });

    if (show) { initBanner(impressionUrl, clickUrl); }
  });

  if (window.bootstrap.config.googleAnalyticsId) {
    trackingEvents(app);
  }
  // Don't re-render tracking pixel on first load. App reads from state
  // (bootstrap) on first load, so override state, and then set the proper
  // config value after render.
  const beginRender = Date.now();

  const postInitialRender = props => {
    // clear dataCache so we don't hydrate again.
    app.setState('dataCache');

    // nuke bootstrap notifications
    app.setState('ctx', { ...window.bootstrap.ctx, notifications: undefined });

    attachFastClick($body);

    const hasHistAndBindLinks = history && bindLinks;
    setEvents(app, hasHistAndBindLinks, render, $body);

    sendTimings(beginRender, props.adsEnabled);
  };

  const serverStatus = bootstrap.ctx ? bootstrap.ctx.status : 500;
  if (serverStatus >= 500 && serverStatus < 600) {
    // If there was any errors on the server, we don't want to automatically
    // retry requests on the client. This increases server load when we know
    // something is probably wrong at the moment and is exacerbated by us
    // hitting multiple endpoints. If we call render or app.render here, it will
    // call koa-router which in turn will re-try data fetches.

    // Instead we can manually re-render the error page.
    // We have to re-render to bind click events. This lets
    // the 'try again' button, top nav, user nav, and etc still work.
    const ctx = {
      ...app.modifyContext(app.buildContext(app.fullPathName())),
      // We need to manually set ctx.route.name for buildProps
      // to work properly
      route: {
        name: bootstrap.actionName,
      },
    };

    const props = buildProps(ctx, app);

    React.render(
      app.errorPage(ctx, serverStatus)(props),
      app.mountPoint
    );

    // But we still want to send timings, bind click events, and etc
    postInitialRender(props);
  } else {
    render(app, app.fullPathName(), true, app.modifyContext).then(postInitialRender);
  }
}

module.exports = initialize;
