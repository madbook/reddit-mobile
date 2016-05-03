import ReactDOM from 'react-dom';
import cookies from 'cookies-js';

import { setMetaColor, setTitle, refreshToken } from './clientLib';
import constants from '../../src/constants';
import EUCountries from '../../src/EUCountries';

const { NIGHTMODE, DAYMODE } = constants.themes;


export default function(app, $body, render, history) {
  app.pushState = (data, title, url) => {
    if (history) {
      history.pushState(data, title, url);
    }
  };

  app.redirect = function redirect(status, path) {
    if ((typeof status === 'string') && !path) {
      path = status;
    }

    const currentUrl = app.fullPathName();
    app.scrollCache[currentUrl] = window.scrollY;

    app.pushState(null, null, path);

    // Set to the browser's interpretation of the current name (to make
    // relative paths easier), and send in the old url.
    render(app, app.fullPathName(), false, app.modifyContext).then(function() {
      app.postRender(path);

      // postRender will adjust scroll to pages we know, and will be called again
      // in the listener for 'pageview'. If we're going to a page that's not
      // in the scrollcache, we should set scroll to top, like you'd expect.
      // We do this here instead of postRender so it only happens when you first load the page.
      // This let you go to a comment with large selftext for the first time, scroll,
      // and not have a janky scrollTop:0 after the comments are fetched. But it also
      // lets you hit back from that comment thread, and preserves your scroll position
      // in the listings page after the listings are pulled from cache.
      if (!app.scrollCache[path]) {
        $body.scrollTop = 0;
      }
    });
  };

  // Redirects to the proper register path if the user isn't logged in.
  //
  // Return truthy because that's easier for consumers to check.
  // Doesn't throw an exception for control flow out of the caller.
  // This would make the consuming code a oneliner but it's not really
  // an error. Plus it will simplfy things for the client-side errors.
  app.needsToLogInUser = function() {
    if (!app.getState('ctx').token) {
      app.redirect(app.config.registerPath);
      return true;
    }
  };

  app.forceRender = function (view, props) {
    ReactDOM.render(view(props), app.config.mountPoint);
  };

  app.postRender = function postRender(href) {
    return function(props) {
      app.setState('referrer', app.fullPathName());
      if (app.scrollCache[href]) {
        $body.scrollTop = app.scrollCache[href];
      }

      if (props) {
        setTitle(props);

        if (!props.data.get('subreddit')) {
          setMetaColor(constants.DEFAULT_KEY_COLOR);
        }
      }
    };
  };

  app.setTokenRefresh = function setTokenRefresh(app, tokenExpires) {
    const now = new Date();
    const expires = new Date(tokenExpires);

    let refreshMS = (expires - now);

    // refresh a little before it expires, to be safe
    refreshMS *= 0.90;

    // if it's within a minute, refresh now
    refreshMS = Math.max(refreshMS - (1000 * 60), 0);

    window.setTimeout(function() {
      refreshToken(app).then(function() {});
    }, refreshMS);
  };

  app.modifyContext = function modifyContext(ctx) {
    const baseCtx = app.getState('ctx');

    const EUCookie = parseInt(cookies.get('EUCookieNotice')) || 0;
    const isEUCountry = EUCountries.indexOf(app.getState('country')) !== -1;

    ctx = Object.assign({}, baseCtx, ctx, {
      dataCache: app.getState('dataCache') || {},
      compact: (cookies.get('compact') || '').toString() === 'true',
      theme: (cookies.get('theme') || '').toString() === NIGHTMODE ? NIGHTMODE : DAYMODE, // just two themes for now...
      showOver18Interstitial: (cookies.get('over18') || 'false').toString() === 'false',
      showEUCookieMessage: (EUCookie < constants.EU_COOKIE_HIDE_AFTER_VIEWS) && isEUCountry,
      showGlobalMessage: cookies.get((app.config.globalMessage || {}).key) === undefined,
      redirect: app.redirect,
      env: 'CLIENT',
      winWidth: window.innerWidth,
      country: app.getState('country'),
      // pick up notifications off of the base for the intial load, since the
      // server sends a delete the first time. delete the basectx.notifications
      // after the first render.
      notifications: baseCtx.notifications ||
                    (decodeURIComponent(cookies.get('notifications') || '')).split(','),
    });

    ctx.loid = cookies.get('loid');
    ctx.loidcreated = cookies.get('loidcreated');

    ctx.headers.referer = app.getState('referrer');

    return ctx;
  };
}
