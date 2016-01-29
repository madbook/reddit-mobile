import 'babel/polyfill';

import superagent from 'superagent';

import errorLog from '../../src/lib/errorLog';

const POST_ERROR_URL = '/error';

function onError(message, url, line, column) {
  const details = {
    userAgent: window.navigator.userAgent,
    message,
    url,
    line,
    column,
    requestUrl: window.location.toString(),
  };

  const hivemind = window.bootstrap && window.bootstrap.config ?
    window.bootstrap.config.statsURL : undefined;

  errorLog(details, {
    hivemind,
    postErrorURL: POST_ERROR_URL,
  });
}

// Register as early as possible
window.onerror = onError;

import '../../src/lib/dnt';

import ReactDOM from 'react-dom';
import throttle from 'lodash/function/throttle';
import forOwn from 'lodash/object/forOwn';

import ClientReactApp from 'horse-react/src/client';
import attachFastClick from 'fastclick';
import mixin from '../../src/app-mixin';

const App = mixin(ClientReactApp);

import defaultConfig from '../../src/config';
import constants from '../../src/constants';
import cookies from 'cookies-js';
import getTimes from '../../src/lib/timing';
import setLoggedOutCookies from '../../src/lib/loid';
import routes from '../../src/routes';

import trackingEvents from './trackingEvents';

import EUCountries from '../../src/EUCountries';

let _lastWinWidth = 0;
const winWidth = window.innerWidth;

let beginRender = 0;

const $body = document.body || document.getElementsByTagName('body')[0];
const $head = document.head || document.getElementsByTagName('head')[0];

const config = defaultConfig();
// the client should post errors to the /error endpoint.
config.postErrorURL = POST_ERROR_URL;

function loadShim() {
  const shimScript = document.createElement('script');
  shimScript.type = 'text\/javascript';
  shimScript.onload = function() {
    initialize(false);
  };

  $head.appendChild(shimScript, document.currentScript);

  shimScript.src =`${window.bootstrap.config.assetPath}/js/es5-shims.js`;
}

function onLoad(fn) {
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    window.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
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

let referrer;

function modifyContext (ctx) {
  const baseCtx = this.getState('ctx');
  const app = this;

  const EUCookie = parseInt(cookies.get('EUCookieNotice')) || 0;
  const isEUCountry = EUCountries.indexOf(this.getState('country')) !== -1;

  ctx = Object.assign({}, baseCtx, ctx, {
    dataCache: app.getState('dataCache') || {},
    compact: (cookies.get('compact') || '').toString() === 'true',
    showOver18Interstitial: (cookies.get('over18') || 'false').toString() === 'false',
    showEUCookieMessage: (EUCookie < constants.EU_COOKIE_HIDE_AFTER_VIEWS) && isEUCountry,
    showGlobalMessage: cookies.get((app.config.globalMessage || {}).key) === undefined,
    redirect: app.redirect,
    env: 'CLIENT',
    winWidth: window.innerWidth,
    // pick up notifications off of the base for the intial load, since the
    // server sends a delete the first time. delete the basectx.notifications
    // after the first render.
    notifications: baseCtx.notifications ||
                  (decodeURIComponent(cookies.get('notifications') || '')).split(','),
  });

  if (!ctx.token) {
    ctx.loid = cookies.get('loid');
    ctx.loidcreated = cookies.get('loidcreated');
  }

  ctx.headers.referer = referrer;

  return ctx;
}

function setTitle(props={}) {
  const $title = document.getElementsByTagName('title')[0];
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

        const token = res.body;

        const now = new Date();
        const expires = new Date(token.tokenExpires);

        Object.assign(app.getState('ctx'), {
          token: token.token,
          tokenExpires: token.tokenExpires,
        });

        app.setState('refreshingToken', false);
        app.emit('token:refresh', token);

        window.setTimeout(function() {
          refreshToken(app).then(function() {
            Object.assign(app.getState('ctx'), {
              token: token.token,
              tokenExpires: token.tokenExpires,
            });

            app.setState('refreshingToken', false);
            app.emit('token:refresh', token);
          });
        }, (expires - now) * 0.9);
      });
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

function elementInDropdown(el) {
  if (el.classList && el.classList.contains(constants.DROPDOWN_CSS_CLASS)) {
    return true;
  } else if (el.parentNode) {
    return elementInDropdown(el.parentNode);
  }

  return false;
}

function sendTimings() {
  // Send the timings during the next cycle.
  if (window.bootstrap.actionName) {
    if (Math.random() < 0.1) { // 10% of requests
      const timings = Object.assign({
        actionName: `m.server.${window.bootstrap.actionName}`,
      }, getTimes());

      timings.mountTiming = (Date.now() - beginRender) / 1000;

      superagent
        .post('/timings')
        .timeout(constants.DEFAULT_API_TIMEOUT)
        .send({
          rum: timings,
        })
        .end(function() {});
    }
  }
}

function render (app, ...args) {
  return new Promise(function(resolve, reject) {
    if (app.getState('refreshingToken')) {

      ReactDOM.render(app.loadingpage(), app.config.mountPoint);

      app.on('token:refresh', function() {
        app.render(...args).then(resolve, reject);
      });
    } else {
      app.render(...args).then(resolve, reject);
    }
  });
}

function initialize(bindLinks) {
  const dataCache = window.bootstrap.dataCache;

  referrer = document.referrer;

  config.mountPoint = document.getElementById('app-container');

  forOwn(config, function(val, key) {
    if (window.bootstrap.config[key]) {
      config[key] = window.bootstrap.config[key];
    }
  });

  config.seed = window.bootstrap.seed || Math.random();

  const app = new App(config);
  routes(app);

  app.setState('userSubscriptions', dataCache.userSubscriptions);

  if (dataCache.user) {
    app.setState('user', dataCache.user);
    app.setState('preferences', dataCache.preferences);

    cookies.set('over18', dataCache.preferences.body.over_18);
  }

  app.emitter.setMaxListeners(30);

  if (app.getState('token')) {
    const now = new Date();
    const expires = new Date(app.getState('tokenExpires'));

    let refreshMS = (expires - now);

    // refresh a little before it expires, to be safe
    refreshMS *= 0.90;

    // if it's within a minute, refresh now
    refreshMS = Math.max(refreshMS - (1000 * 60), 0);

    window.setTimeout(function() {
      refreshToken(app).then(function() {});
    }, refreshMS);
  } else if (!cookies.get('loid')) {
    setLoggedOutCookies(cookies, app);
  }

  app.router.get('/oauth2/login', function * () {
    window.location = '/oauth2/login';
  });

  // env comes from bootstrap from the server, update now that the client is loading
  app.state.ctx.env = 'CLIENT';
  app.modifyContext = modifyContext.bind(app);

  const history = window.history || window.location.history;
  app.pushState = (data, title, url) => {
    if (history) {
      history.pushState(data, title, url);
    }
  };

  app.redirect = function redirect(status, path) {
    if ((typeof status === 'string') && !path) {
      path = status;
    }

    if (path.indexOf(config.loginPath) === 0 ||
        path.indexOf(config.registerPath) === 0) {
      window.location = path;
      return;
    }

    app.pushState(null, null, path);

    // Set to the browser's interpretation of the current name (to make
    // relative paths easier), and send in the old url.
    render(app, app.fullPathName(), false, app.modifyContext).then(postRender(path));
  };

  // Redirects to the proper register path if the user isn't logged in.
  //
  // Return truthy because that's easier for consumers to check.
  // Doesn't throw an exception for control flow out of the caller.
  // This would make the consuming code a oneliner but it's not really
  // an error. Plus it will simplfy things for the client-side errors.
  app.needsToLogInUser = function() {
    if (!this.getState('token')) {
      this.redirect(this.config.registerPath);
      return true;
    }
  }.bind(app);

  app.forceRender = function (view, props) {
    ReactDOM.render(view(props), app.config.mountPoint);
  };

  const scrollCache = {};

  let ignoredInitialPopState = false;
  let initialUrl = app.fullPathName();

  function postRender(href) {
    return function(props) {
      if (scrollCache[href]) {
        $body.scrollTop = scrollCache[href];
      } else {
        $body.scrollTop = 0;
      }

      if (props) {
        setTitle(props);

        if (!props.data.get('subreddit')) {
          setMetaColor(constants.DEFAULT_KEY_COLOR);
        }
      }
    };
  }

  function logMissingHref($link) {
    const $linkClone = $link.cloneNode(true);
    const $tmpWrapper = document.createElement('div');
    $tmpWrapper.appendChild($linkClone);
    const linkStringified = $tmpWrapper.innerHTML;

    const error = {
      message: 'A tag missing HREF',
      linkStringified,
    };

    const options = {
      redirect: false,
      replaceBody: false,
    };

    app.error(error, app.getState('ctx'), app, options);
  }

  function attachEvents() {
    attachFastClick(document.body);

    if (history && bindLinks) {
      $body.addEventListener('click', function(e) {
        let $link = e.target;

        if ($link.tagName !== 'A') {
          $link = findLinkParent($link);

          if (!$link) {
            return;
          }
        }

        const href = $link.getAttribute('href');
        if (!href) {
          logMissingHref($link);
          return;
        }

        const currentUrl = app.fullPathName();

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
        const a = document.createElement('a');
        a.href = currentUrl;
        referrer = a.href;

        // Let app.redirect do the heavy lifting. It has the the fancy
        // check for login / register
        app.redirect(href);
      });

      window.addEventListener('popstate', function() {
        const href = app.fullPathName();
        if (href === initialUrl && !ignoredInitialPopState) {
          ignoredInitialPopState = true;
          return;
        }

        scrollCache[initialUrl] = window.scrollY;

        render(app, href, false, app.modifyContext).then(postRender(href));

        initialUrl = href;
      });
    }
  }

  // Don't re-render tracking pixel on first load. App reads from state
  // (bootstrap) on first load, so override state, and then set the proper
  // config value after render.
  beginRender = Date.now();

  render(app, app.fullPathName(), true, app.modifyContext).then(function() {
    app.setState('dataCache');

    // nuke bootstrap notifications
    app.setState('ctx', { ...window.bootstrap.ctx, notifications: undefined });

    attachEvents();
    referrer = document.location.href;
    sendTimings();
  });

  app.on('route:desktop', function(route) {
    const options = {};

    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    options.expires = date;

    if (window.location.host.indexOf('localhost') === -1) {
      const domain = `.${window.bootstrap.config.reddit}`
        .match(/https?:\/\/(.+)/)[1]
        .split('.')
        .splice(1,2)
        .join('.');

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
    cookies.set('over18', val);
  });

  app.on('notification', function(notification) {
    this.setNotification(cookies, notification);
  }.bind(app));

  app.on('pageview', function() {
    // reset notifications once the page loads
    cookies.set('notifications');
  });

  app.on(constants.HIDE_GLOBAL_MESSAGE, function(message) {
    const options = {
      expires: new Date(message.expires),
    };
    cookies.set(message.key, 'globalMessageSeen', options);
  });

  const elementCanScroll = function elementCanScroll(el) {
    const top = el.scrollTop;

    if (top <= 0) {
      el.scrollTop = 1;
      return false;
    }

    const totalScroll = top + el.offsetHeight;
    if (totalScroll === el.scrollHeight) {
      el.scrollTop = top - 1;
      return false;
    }

    return true;
  };

  const stopScroll = throttle(function stopScroll(e) {
    let touchMoveAllowed = false;
    let target = e.target;

    while (target !== null) {
      if (target.classList && target.classList.contains(constants.OVERLAY_MENU_CSS_CLASS)) {
        if (elementCanScroll(target)) {
          touchMoveAllowed = true;
        }
        break;
      }

      target = target.parentNode;
    }

    if (!touchMoveAllowed) {
      e.preventDefault();
    }
  }, 50);

  app.on(constants.OVERLAY_MENU_OPEN, function(open) {
    if (!$body.classList) {
      return;
    }

    // Scrolling on Safari is weird, possibly iOS 9. Overflow hidden doesn't
    // prevent the page background from scrolling as you'd expect.
    // When we're on Safari we do a fancy check to stop touchmove events
    // from scrolling the background.
    // We don't use position: fixed becuase the repaint from changing position
    // is slow in safari. Plus there's extra bookkeeping for preserving the
    // scroll position.
    if (open) {
      if ($body.classList.contains(constants.OVERLAY_MENU_VISIBLE_CSS_CLASS)) {
        return;
      }

      $body.classList.add(constants.OVERLAY_MENU_VISIBLE_CSS_CLASS);
      $body.addEventListener('touchmove', stopScroll);
    } else {
      $body.classList.remove(constants.OVERLAY_MENU_VISIBLE_CSS_CLASS);
      $body.removeEventListener('touchmove', stopScroll);
    }
  });

  function closeDropdowns() {
    // close any opened dropdown by faking another dropdown opening
    app.emit(constants.DROPDOWN_OPEN);
  }

  window.addEventListener('click', function(e) {
    if (!elementInDropdown(e.target)) {
      closeDropdowns();
    }
  });

  window.addEventListener('scroll', throttle(function() {
    app.emit(constants.SCROLL);
  }, 100));

  window.addEventListener('resize', throttle(function() {
    // Prevent resize from firing when chrome shows/hides nav bar
    if (winWidth !== _lastWinWidth) {
      _lastWinWidth = winWidth;
      app.emit(constants.RESIZE);
    }
  }, 100));

  function setMetaColor (color) {
    const metas = Array.prototype.slice.call(document.getElementsByTagName('meta'));

    const tag = metas.find(function(m) {
      return m.getAttribute('name') === 'theme-color';
    });

    tag.content = color;
  }

  app.on(constants.SET_META_COLOR, setMetaColor);

  if (window.bootstrap.config.googleAnalyticsId) {
    trackingEvents(app);
  }
}

module.exports = initialize;
