import 'babel/polyfill';

import $ from 'jquery';
global.jQuery = global.$ = $;

import querystring from 'querystring';

import attachFastClick from 'fastclick';

import {ClientReactApp} from 'horse-react';
import mixin from '../../src/app-mixin';

ClientReactApp = mixin(ClientReactApp);

import config from '../../src/config';
import plugins from '../../src/plugins';

import routes from '../../src/routes';
import TweenLite from 'gsap';

// A few es5 sanity checks
if (!Object.create || !Array.prototype.map || !Object.freeze) {
  $.getScript('/js/es5-shims.js', function(){
    initialize(false);
  })
} else {
  initialize(true);
}

function modifyContext (ctx) {
  ctx.loid = this.getState('loid');
  ctx.loidcreated = this.getState('loidcreated');
  ctx.token = this.getState('token');
  ctx.user = this.getState('user');

  return ctx;
}

function initialize(bindLinks) {

  $(function() {
    var plugin;
    var p;
    var $body = $('body');


    config.mountPoint = document.getElementById('app-container');

    var app = new ClientReactApp(config);

    app.router.get('/oauth2/login', function * () {
      window.location = '/oauth2/login';
    });

    if (plugins) {
      for (p in plugins) {
        plugin = plugins[p];
        plugin.register(app);
      }
    }

    routes(app);

    modifyContext = modifyContext.bind(app);

    var history = window.history || window.location.history;
    app.pushState = (data, title, url) => {
      if (history) {
        history.pushState(data, title, url);
      }
    };

    var scrollCache = {};

    var initialUrl = app.fullPathName();
    attachFastClick(document.body);

    if(history && bindLinks) {
      $body.on('click', 'a', function(e) {
        var $link = $(this);
        var href = $link.attr('href');
        var currentUrl = app.fullPathName();

        // If it has a target=_blank, or an 'external' data attribute, or it's
        // an absolute url, let the browser route rather than forcing a capture.
        if (
          ($link.attr('target') === '_blank' || $link.attr('data-no-route')) ||
          href.indexOf('//') > -1
        ) {
          return;
        }

        e.preventDefault();

        scrollCache[currentUrl] = window.scrollY;

        if (href.indexOf('#') === 0) {
          return;
        }

        initialUrl = href;

        app.pushState(null, null, href);

        // Set to the browser's interpretation of the current name (to make
        // relative paths easier), and send in the old url.
        app.render(app.fullPathName(), false, modifyContext);
      });

      $(window).on('popstate', function(e) {
        var href = app.fullPathName();
        // Work around some browsers firing popstate on initial load
        if (href !== initialUrl) {
          scrollCache[initialUrl] = window.scrollY;

          app.render(href, false, modifyContext).then(function() {
            if(scrollCache[href]) {
              $('html, body').animate({
                scrollTop: scrollCache[href],
              }, 0);
            }
          });

          initialUrl = href;
        }
      });
    }

    // Don't re-render tracking pixel on first load. App reads from state
    // (bootstrap) on first load, so override state, and then set the proper
    // config value after render.
    app.setState('renderTracking', false);
    app.render(app.fullPathName(), true, modifyContext);
    app.config.renderTracking = true;
  });
}

module.exports = initialize;
