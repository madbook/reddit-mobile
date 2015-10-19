import 'babel/polyfill';

import errorLog from '../../src/lib/errorLog';

function onError(message, url, line, column) {
  errorLog({
    userAgent: window.navigator.userAgent,
    message,
    url,
    line,
    column,
  }, {
    hivemind: window.bootstrap && window.bootstrap.config ? window.bootstrap.config.statsDomain : undefined,
  });
}

// Register as early as possible
window.onerror = onError;

import React from 'react';
import throttle from 'lodash/function/throttle';
import forOwn from 'lodash/object/forOwn';

import {ClientReactApp} from 'horse-react';
import attachFastClick from 'fastclick';
import mixin from '../../src/app-mixin';
import querystring from 'querystring';
import superagent from 'superagent';

var App = mixin(ClientReactApp);

import defaultConfig from '../../src/config';
import constants from '../../src/constants';
import cookies from 'cookies-js';
import getTimes from '../../src/lib/timing';
import globals from '../../src/globals';
import randomBySeed from '../../src/lib/randomBySeed';
import setLoggedOutCookies from '../../src/lib/loid';
import Utils from '../../src/lib/danehansen/utils/Utils';
import routes from '../../src/routes';

import trackingEvents from './trackingEvents';

var _lastWinWidth = 0;
var beginRender = 0;

var $body = document.body || document.getElementsByTagName('body')[0];
var $head = document.head || document.getElementsByTagName('head')[0];

var config = defaultConfig();

function loadShim() {
  var shimScript = document.createElement('script');
  shimScript.type = 'text\/javascript';
  shimScript.onload = function() {
    initialize(false);
  }

  $head.appendChild(shimScript, document.currentScript);

  shimScript.src = window.bootstrap.config.assetPath + '/js/es5-shims.js';
}

function onLoad(fn) {
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    window.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

function redirect(status, path) {
  if ((typeof status === 'string') && !path) {
    path = status;
  }

  if (path.indexOf('/login') > -1 || path.indexOf('/register') > -1 ) {
    window.location = path;
  } else {
    this.redirect(path);
  }
}

// A few es5 sanity checks
if (!Object.create || !Array.prototype.map || !Object.freeze) {
  onLoad(loadShim);
} else {
  onLoad(function() {
    initialize(true);
  });
}

var referrer;

function modifyContext (ctx) {
  let baseCtx = this.getState('ctx');
  let app = this;

  ctx = Object.assign({}, baseCtx, ctx, {
    dataCache: app.getState('dataCache') || {},
    compact: (cookies.get('compact') || '').toString() === 'true',
    showOver18Interstitial: (cookies.get('over18') || 'false').toString() === 'false',
    redirect: redirect.bind(app),
    env: 'CLIENT',
  });

  if (!ctx.token) {
    ctx.loid = cookies.get('loid');
    ctx.loidcreated = cookies.get('loidcreated');
  }

  ctx.headers.referer = referrer;

  return ctx;
}

var $title = document.getElementsByTagName('title')[0];

function setTitle(props={}) {
  if (props.title) {
    if ($title.textContent) {
      $title.textContent = props.title;
    } else if ($title.innerText) {
      $title.innerText = props.title;
    }
  }
}

function refreshToken (app) {
  app.setState('refreshingToken', true);

  return new Promise(function(resolve, reject) {
    superagent
      .get('/oauth2/refresh')
      .end(function(err, res) {
        if (err) {
          reject(err);
        }

        var token = res.body;

        var now = new Date();
        var expires = new Date(token.tokenExpires);

        Object.assign(app.getState('ctx'), {
          token: token.token,
          tokenExpires: token.tokenExpires
        });

        app.setState('refreshingToken', false);
        app.emit('token:refresh', token);

        window.setTimeout(function() {
          refreshToken(app).then(function(){
            Object.assign(app.getState('ctx'), {
              token: token.token,
              tokenExpires: token.tokenExpires
            });

            app.setState('refreshingToken', false);
            app.emit('token:refresh', token);
          });
        }, (expires - now) * .9);
      });
  })
}

function findLinkParent(el) {
  if (el.parentNode) {
    if (el.parentNode.tagName === 'A') {
      return el.parentNode;
    }

    return findLinkParent(el.parentNode);
  }
}

function sendTimings() {
  // Send the timings during the next cycle.
  if (window.bootstrap.actionName) {
    if (Math.random() < .1) { // 10% of requests
      var timings = Object.assign({
        actionName: 'm.server.' + window.bootstrap.actionName,
      }, getTimes());

      timings.mountTiming = (Date.now() - beginRender) / 1000;

      superagent
        .post('/timings')
        .send({
          rum: timings,
        })
        .end(function(){});
    }
  }
}

function render (app, ...args) {
  return new Promise(function(resolve, reject) {
    if (app.getState('refreshingToken')) {

      React.render(app.loadingpage(), app.config.mountPoint);

      app.on('token:refresh', function() {
        app.render(...args).then(resolve, reject);
      });
    } else {
      app.render(...args).then(resolve, reject);
    }
  });
}

function initialize(bindLinks) {
  var plugin;
  var p;

  referrer = document.referrer;

  config.mountPoint = document.getElementById('app-container');
  config.touch = true;

  forOwn(config, function(val, key) {
    if (window.bootstrap.config[key]) {
      config[key] = window.bootstrap.config[key];
    }
  });

  config.seed = window.bootstrap.seed || Math.random();

  globals().touch = Utils.touch();
  globals().random = randomBySeed(config.seed);

  var app = new App(config);
  routes(app);

  app.setState('userSubscriptions', window.bootstrap.dataCache.userSubscriptions);

  if (window.bootstrap.dataCache.user) {
    app.setState('user', window.bootstrap.dataCache.user);
    app.setState('userPrefs', window.bootstrap.dataCache.userPrefs);

    cookies.set('over18', window.bootstrap.dataCache.preferences.over_18);
  }

  app.emitter.setMaxListeners(30);

  if (app.getState('token')) {
    var now = new Date();
    var expires = new Date(app.getState('tokenExpires'));

    var refreshMS = (expires - now);

    // refresh a little before it expires, to be safe
    refreshMS *= .90;

    // if it's within a minute, refresh now
    refreshMS = Math.max(refreshMS - (1000 * 60), 0);

    window.setTimeout(function() {
      refreshToken(app).then(function(){});
    }, refreshMS);
  } else if (!cookies.get('loid')) {
    setLoggedOutCookies(cookies, app);
  }

  app.router.get('/oauth2/login', function * () {
    window.location = '/oauth2/login';
  });

  modifyContext = modifyContext.bind(app);
  app.modifyContext = modifyContext;

  var history = window.history || window.location.history;
  app.pushState = (data, title, url) => {
    if (history) {
      history.pushState(data, title, url);
    }
  };

  app.redirect = function(url) {
    app.pushState(null, null, url);

    // Set to the browser's interpretation of the current name (to make
    // relative paths easier), and send in the old url.
    render(app, app.fullPathName(), false, modifyContext).then(function(props) {
      setTitle(props);
    });
  }

  var scrollCache = {};

  var initialUrl = app.fullPathName();

  function postRender(href) {
    return function(props) {
      if(scrollCache[href]) {
        $body.scrollTop = scrollCache[href];
      } else {
        $body.scrollTop = 0;
      }

      setTitle(props);
    }
  }

  function attachEvents() {
    attachFastClick(document.body);

    if(history && bindLinks) {

      $body.addEventListener('click', function(e) {
        var $link = e.target;

        if ($link.tagName !== 'A') {
          $link = findLinkParent($link);

          if (!$link) {
            return;
          }
        }

        var href = $link.getAttribute('href');
        var currentUrl = app.fullPathName();

        // If it has a target=_blank, or an 'external' data attribute, or it's
        // an absolute url, let the browser route rather than forcing a capture.
        if (
          ($link.target === '_blank' || $link.dataset.noRoute === 'true') ||
          href.indexOf('//') > -1
        ) {
          return;
        }

        // If the href contains script ignore it
        if (/^javascript:/.test(href)) {
          return;
        }

        e.preventDefault();

        scrollCache[currentUrl] = window.scrollY;

        if (href.indexOf('#') === 0) {
          return;
        }

        initialUrl = href;

        // Update the referrer before navigation
        var a = document.createElement('a');
        a.href = currentUrl;
        referrer = a.href;

        app.pushState(null, null, href);

        // Set to the browser's interpretation of the current name (to make
        // relative paths easier), and send in the old url.
        render(app, app.fullPathName(), false, modifyContext).then(postRender(href));
      });

      window.addEventListener('popstate', function(e) {
        var href = app.fullPathName();
        scrollCache[initialUrl] = window.scrollY;

        render(app, href, false, modifyContext).then(postRender(href));

        initialUrl = href;
      });
    }
  }

  // Don't re-render tracking pixel on first load. App reads from state
  // (bootstrap) on first load, so override state, and then set the proper
  // config value after render.
  beginRender = Date.now();

  // If we're using an old render cache from a restore, nuke it
  if ((beginRender - window.bootstrap.render) > 1000 * 60 * 5) {
    app.setState('dataCache');
  }

  render(app, app.fullPathName(), true, modifyContext).then(function() {
    app.setState('dataCache');

    attachEvents();
    referrer = document.location.href;
    sendTimings();
  });

  app.on('route:desktop', function(route) {
    let options = {};

    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    options.expire = date;

    if (window.location.host.indexOf('localhost') === -1) {
      var domain = '.' + window.bootstrap.config.reddit.match(/https?:\/\/(.+)/)[1].split('.').splice(1,2).join('.');
      options.domain = domain;
    }

    cookies.set('__cf_mob_redir', '0', options);

    if (route.indexOf('?') === -1) {
      route += '?ref_source=mweb';
    } else {
      route += '&ref_source=mweb';
    }

    window.location = `https://www.reddit.com${route}`;
  });

  app.on(constants.COMPACT_TOGGLE, function(compact) {
    app.setState('compact', compact);
  });

  app.on(constants.TOGGLE_OVER_18, function(val) {
    cookies.set('over18', val)
  });

  window.addEventListener('scroll', throttle(function() {
      app.emit(constants.SCROLL);
    }.bind(app), 100));

  globals().winWidth = window.innerWidth;
  window.addEventListener('resize', throttle(function(e) {
    // Prevent resize from firing when chrome shows/hides nav bar
    globals().winWidth = window.innerWidth;
    if (globals().winWidth !== _lastWinWidth) {
      _lastWinWidth = globals().winWidth;
      app.emit(constants.RESIZE);
    }
  }.bind(app), 100));

  if (window.bootstrap.config.googleAnalyticsId) {
    trackingEvents(app);
  }
}

module.exports = initialize;
