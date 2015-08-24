import 'babel/polyfill';

import throttle from 'lodash/function/throttle';
import forOwn from 'lodash/object/forOwn';

import {ClientReactApp} from 'horse-react';
import attachFastClick from 'fastclick';
import mixin from '../../src/app-mixin';
import querystring from 'querystring';
import superagent from 'superagent';

var App = mixin(ClientReactApp);

import config from '../../src/config';
import constants from '../../src/constants';
import cookies from 'cookies-js';
import getTimes from '../../src/lib/timing';
import globals from '../../src/globals';
import randomBySeed from '../../src/lib/randomBySeed';
import routes from '../../src/routes';
import Utils from '../../src/lib/danehansen/utils/Utils';

import trackingEvents from './trackingEvents';
import TweenLite from 'gsap';

var _lastWinWidth = 0;
var beginRender = 0;

function loadShim() {
  var head = document.head || document.getElementsByTagName('head')[0];

  var shimScript = document.createElement('script');
  shimScript.type = 'text\/javascript';
  shimScript.onload = function() {
    initialize(false);
  }

  head.appendChild(shimScript, document.currentScript);

  shimScript.src = window.bootstrap.assetPath + '/js/es5-shims.js';
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

var referrer = document.referrer;

function modifyContext (ctx) {
  ctx.token = this.getState('token');

  if (!ctx.token) {
    ctx.loid = cookies.get('loid');
    ctx.loidcreated = cookies.get('loidcreated');
  }

  ctx.user = this.getState('user');
  ctx.useCache = true;
  ctx.experiments = this.getState('experiments');
  ctx.headers.referer = referrer;

  // Is set with a client-side cookie, sometimes hitting 'back' doesn't
  // restore proper state
  ctx.compact = (cookies.get('compact') || '').toString() === 'true';

  ctx.redirect = redirect.bind(this);

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

function refreshToken (app, tries=0) {
  if (tries >= 3) {
    window.location = '/logout';
  }

  superagent
    .get('/oauth2/refresh')
    .end(function(err, res) {
      if (err) {
        return window.setTimeout(function() {
            refreshToken(app, tries + 1);
        }, 1000 * 10);
      }

      var token = res.body;
      app.setState('token', token.token);
      app.setState('tokenExpires', token.tokenExpires);

      var now = new Date();
      var expires = new Date(token.tokenExpires);

      window.setTimeout(function() {
        refreshToken(app);
      }, (expires - now) * .9);
    });
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
    var timings = Object.assign({
      actionName: 'm.server.' + window.bootstrap.actionName,
    }, getTimes());

    timings.mountTiming = (Date.now() - beginRender) / 1000;

    var $csrf = document.getElementById('csrf-token-meta-tag');

    superagent
      .post('/timings')
      .send({
        rum: timings,
        _csrf: $csrf.content,
      })
      .end(function(){});
  }
}

function initialize(bindLinks) {
  var plugin;
  var p;

  config.mountPoint = document.getElementById('app-container');
  config.touch = true;

  forOwn(config, function(val, key) {
    if (bootstrap[key]) {
      config[key] = bootstrap[key];
    }
  });

  config.seed = window.bootstrap.seed || Math.random();

  globals().touch = Utils.touch();
  globals().random = randomBySeed(config.seed);

  var app = new App(config);
  globals().app = app;

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
      refreshToken(app);
    }, refreshMS);
  };

  app.router.get('/oauth2/login', function * () {
    window.location = '/oauth2/login';
  });

  routes(app);

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
    app.render(app.fullPathName(), false, modifyContext).then(function(props) {
      setTitle(props);
    });
  }

  var scrollCache = {};

  var initialUrl = app.fullPathName();

  function attachEvents() {
    attachFastClick(document.body);

    if(history && bindLinks) {
      var $body = document.body;

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
        app.render(app.fullPathName(), false, modifyContext).then(function(props) {
          setTitle(props);
        });
      });

      window.addEventListener('popstate', function(e) {
        var href = app.fullPathName();
        // Work around some browsers firing popstate on initial load
        if (href !== initialUrl) {
          scrollCache[initialUrl] = window.scrollY;

          app.render(href, false, modifyContext).then(function(props) {
            if(scrollCache[href]) {
              $body.scrollTop = scrollCache[href];
            }

            setTitle(props);
          });

          initialUrl = href;
        }
      });
    }
  }

  // Don't re-render tracking pixel on first load. App reads from state
  // (bootstrap) on first load, so override state, and then set the proper
  // config value after render.
  beginRender = Date.now();
  app.render(app.state.url, true, modifyContext).then(function() {
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
      var domain = '.' + bootstrap.reddit.match(/https?:\/\/(.+)/)[1].split('.').splice(1,2).join('.');
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

  if (window.bootstrap.propertyId) {
    trackingEvents(app);
  }
}

module.exports = initialize;
