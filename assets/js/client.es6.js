import 'babel-polyfill';

import { sendTimings, onError, loadShimThenInitialize, onLoad, render } from './clientLib';

// Register as early as possible
window.onerror = onError;

import '../../src/lib/dnt';
import initBanner from '../../src/lib/initBanner';

import forOwn from 'lodash/object/forOwn';

import ClientReactApp from 'horse-react/src/client';
import attachFastClick from 'fastclick';
import mixin from '../../src/app-mixin';

const App = mixin(ClientReactApp);

import config from '../../src/config';
import cookies from 'cookies-js';
import setLoggedOutCookies from '../../src/lib/loid';
import routes from '../../src/routes';

import trackingEvents from './trackingEvents';

import setAppMethods from './appMethods';
import setEvents from './clientEvents';
import constants from '../../src/constants';

const APP_DOWNLOAD_URLS = {
  'index': constants.BANNER_URLS.FRONTPAGE,
  'index.subreddit': constants.BANNER_URLS.LISTING,
  'comments.index': constants.BANNER_URLS.COMMENTS,
};

const SMARTBANNER_BUCKET = 5;

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
    // add a smart banner/toaster if the user lands on certain pages.
    const userId = (data.data.loid || data.data.user.id);
    const userIdSum = userId.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0);
    const bucket = userIdSum % 100;
    const featureEnabled = data.feature.enabled(constants.flags.SMARTBANNER);
    const downloadUrl = APP_DOWNLOAD_URLS[data.actionName];
    const inBucket = data.actionName === 'comments.index' ? bucket < SMARTBANNER_BUCKET : true;

    if (featureEnabled && downloadUrl && inBucket) {
      const { IMPRESSION, CLICK } = downloadUrl;
      initBanner(IMPRESSION, CLICK);
    }
  });

  if (window.bootstrap.config.googleAnalyticsId) {
    trackingEvents(app);
  }
  // Don't re-render tracking pixel on first load. App reads from state
  // (bootstrap) on first load, so override state, and then set the proper
  // config value after render.
  const beginRender = Date.now();

  render(app, app.fullPathName(), true, app.modifyContext).then(function() {
    // clear dataCache so we don't hydrate again.
    app.setState('dataCache');

    // nuke bootstrap notifications
    app.setState('ctx', { ...window.bootstrap.ctx, notifications: undefined });

    attachFastClick($body);

    const hasHistAndBindLinks = history && bindLinks;
    setEvents(app, hasHistAndBindLinks, render, $body);

    sendTimings(beginRender);
  });
}

module.exports = initialize;
