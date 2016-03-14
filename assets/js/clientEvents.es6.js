import constants from '../../src/constants';

import cookies from 'cookies-js';
import throttle from 'lodash/function/throttle';

import { elementInOtherEl,
         findLinkParent,
         logMissingHref,
         stopScroll,
         setMetaColor } from './clientLib';


export default function setAppEvents(app, hasHistAndBindLinks, render, $body) {
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
    app.setNotification(cookies, notification);
  });

  app.on('pageview', function() {
    // reset notifications once the page loads
    cookies.set('notifications');

    // update the scroll position when data finishes loading
    app.postRender(app.fullPathName())();
  });

  app.on(constants.HIDE_GLOBAL_MESSAGE, function(message) {
    const options = {
      expires: new Date(message.expires),
    };
    cookies.set(message.key, 'globalMessageSeen', options);
  });

  const stopScrollForMenu = stopScroll(constants.OVERLAY_MENU_CSS_CLASS);

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
      $body.addEventListener('touchmove', stopScrollForMenu);
    } else {
      $body.classList.remove(constants.OVERLAY_MENU_VISIBLE_CSS_CLASS);
      $body.removeEventListener('touchmove', stopScrollForMenu);
    }
  });

  app.on(constants.SET_META_COLOR, setMetaColor);

  let initialUrl = app.fullPathName();
  if (hasHistAndBindLinks) {
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
        logMissingHref($link, app);
        return;
      }

      // If it has a target=_blank, or an 'external' data attribute, or it's
      // an absolute url, let the browser route rather than forcing a capture.
      //
      // Or, if a user has the control (or cmd key, OSX) down, then don't
      // capture.
      if (
        ($link.target === '_blank' || $link.dataset.noRoute === 'true') ||
        href.indexOf('//') > -1 ||
        (e.metaKey || e.ctrlKey)
      ) {
        return;
      }

      // If the href contains script ignore it
      if (/^javascript:/.test(href)) {
        return;
      }

      e.preventDefault();

      const currentUrl = app.fullPathName();
      if (currentUrl === href) {
        return;
      }

      app.scrollCache[currentUrl] = window.scrollY;

      if (href.indexOf('#') === 0) {
        return;
      }

      initialUrl = href;

      // Update the referrer before navigation
      const a = document.createElement('a');
      a.href = currentUrl;
      app.setState('referrer', a.href);

      // Let app.redirect do the heavy lifting. It has the the fancy
      // check for login / register
      app.redirect(href);
    });

    // for initial safari popstate check.
    let ignoredInitialPopState = false;

    window.addEventListener('popstate', function() {
      const href = app.fullPathName();
      if (href === initialUrl && !ignoredInitialPopState) {
        ignoredInitialPopState = true;
        return;
      }

      app.scrollCache[initialUrl] = window.scrollY;

      render(app, href, false, app.modifyContext).then(app.postRender(href));

      initialUrl = href;
    });
  }

  /* Window events */
  window.addEventListener('click', function(e) {
    if (!elementInOtherEl(e.target, constants.DROPDOWN_CSS_CLASS)) {
      // close any opened dropdown by faking another dropdown opening
      app.emit(constants.DROPDOWN_OPEN);
    }
  });

  window.addEventListener('scroll', throttle(function() {
    app.emit(constants.SCROLL);

    // Preseve scroll position if you scroll while waiting for content to load
    const href = app.fullPathName();
    app.scrollCache[href] = window.scrollY;
  }, 100));

  let _lastWinWidth = 0;
  const winWidth = window.innerWidth;

  window.addEventListener('resize', throttle(function() {
    // Prevent resize from firing when chrome shows/hides nav bar
    if (winWidth !== _lastWinWidth) {
      _lastWinWidth = winWidth;
      app.emit(constants.RESIZE);
    }
  }, 100));
}
