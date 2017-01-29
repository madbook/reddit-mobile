import 'babel-polyfill';
import './lib/dnt';

import React from 'react';
import Raven from 'raven-js';
import Client from '@r/platform/Client';
import * as platformActions from '@r/platform/actions';
import isEmpty from 'lodash/isEmpty';

import { isLocalStorageAvailable } from '@r/redux-state-archiver';

import App from 'app';
import config from 'config';
import errorLog from 'lib/errorLog';
import { initGoogleTagManager } from 'lib/gtm';
import routes from 'app/router';
import reducers from 'app/reducers';
import reduxMiddleware from 'app/reduxMiddleware';
import ravenMiddleware from 'app/reduxMiddleware/raven';
import { sendTimings, onHandlerCompleteTimings } from 'lib/timing';
import Session from 'app/models/Session';
import * as xpromoActions from 'app/actions/xpromo';
import Preferences from 'apiClient/models/Preferences';

Raven
  .config(process.env.SENTRY_CLIENT_PUBLIC_URL, {
    release: __GLOBALS__.release,
    environment: process.env.NODE_ENV,
  })
  .install();

// Bits to help in the gathering of client side timings to relay back
// to the server
const beginMount = Date.now();
let isShell;

window.onload = () => {
  const endMount = Date.now();
  sendTimings(beginMount, endMount, isShell);
  initGoogleTagManager(client.getState().platform.currentPage.urlParams.subredditName);
};

const ERROR_ENDPOINTS = {
  log: config.postErrorURL,
  hivemind: config.statsURL,
};

const ERROR_LOG_OPTIONS = {
  SHOULD_RETHROW: false, // prevent error-log from re-throwing errors that were uncaught
};

const fullPathName = () => {
  // window.location.pathname doesn't include query params, hash, etc
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

const getUserAgentAndURL = () => ({
  userAgent: window.navigator.userAgent,
  requestUrl: fullPathName(),
});

// register `window.onerror` and `window.onunhandledrejection` handlers
// asap to start logging any errors that come through.
// We pass ERROR_ENDPOINTS to configure the endpoints we log to,
// and ERROR_LOG_OPTIONS to prevent double logging errors.
// RE the latter, `errorLog` rethrows errors and rejection events
// in a new callstack so chrome's default error-logging will
// do its default error formatting and stack traces. We don't want to re-throw
// these top-level errors and rejections, because they'd show up in the console
// twice.
window.onerror = (message, url, line, column, error) => {
  errorLog({
    ...getUserAgentAndURL(),
    error,
    message,
    url,
    line,
    column,
  }, ERROR_ENDPOINTS, ERROR_LOG_OPTIONS);

  Raven.captureException(error);
};

// This isn't supported in most mobile browsers right now but it is in chrome.
// Having it will give us better logging in debug (for promises that don't have
// a .catch handler). Maybe mobile browsers will support it soon as well.
window.onunhandledrejection = rejection => {
  errorLog({
    ...getUserAgentAndURL(),
    rejection,
  }, ERROR_ENDPOINTS, ERROR_LOG_OPTIONS);

  // raven does not automatically listen to this, unlike window.onerror
  Raven.captureException(rejection.reason);
};

// start the app now
const client = Client({
  routes,
  reducers,
  reduxMiddleware: [ravenMiddleware(Raven)].concat(reduxMiddleware),
  modifyData: data => {
    // TODO if we start not using shell rendering in a serious way,
    // we'll need to unserialize all of the api models. This should
    // be considered when we debate using JSON output from the models
    // instead of the api model instances.

    if (!isEmpty(data.session)) {
      data.session = new Session(data.session);
      window.session = data.session;
    }

    data.preferences = Preferences.fromJSON(data.preferences);

    data.meta.env = 'CLIENT';

    // Pull some defaults from localStorage (if available)
    if (isLocalStorageAvailable()) {
      try {
        const collapsedComments = window.localStorage.collapsedComments;
        if (collapsedComments !== undefined) {
          data.collapsedComments = JSON.parse(collapsedComments);
        }
      } catch (e) { console.warn(e); }

      try {
        const expandedPosts = window.localStorage.expandedPosts;
        if (expandedPosts !== undefined) {
          data.expandedPosts = JSON.parse(expandedPosts);
        }
      } catch (e) { console.warn(e); }

      try {
        const visitedPosts = window.localStorage.visitedPosts;
        if (visitedPosts !== undefined) {
          if (!visitedPosts.startsWith('[')) {
            // Old format -- comma separated string
            data.visitedPosts = visitedPosts.split(',');
          } else {
            data.visitedPosts = JSON.parse(visitedPosts);
          }
        }
      } catch (e) { console.warn(e); }

      try {
        const optOuts = window.localStorage.optOuts;
        if (optOuts !== undefined) {
          data.optOuts = JSON.parse(optOuts);
        }
      } catch (e) { console.warn(e); }
    }

    return data;
  },
  appComponent: <App/>,
  debug: (process.env.NODE_ENV || 'production') !== 'production',
  onHandlerComplete: onHandlerCompleteTimings,
})();

isShell = client.getState().platform.shell;
client.dispatch(platformActions.activateClient());

if (isShell) {
  client.dispatch(xpromoActions.checkAndSet());
}
