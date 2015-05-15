import 'babel/polyfill';

import _ from 'lodash';
import $ from 'jquery';
global.jQuery = global.$ = $;

import querystring from 'querystring';

import attachFastClick from 'fastclick';

import {ClientReactApp} from 'horse-react';
import mixin from '../../src/app-mixin';

var App = mixin(ClientReactApp);

import config from '../../src/config';
import plugins from '../../src/plugins';

import constants from '../../src/constants';

import routes from '../../src/routes';
import TweenLite from 'gsap';

import getTimes from '../../src/lib/timing';

// A few es5 sanity checks
if (!Object.create || !Array.prototype.map || !Object.freeze) {
  $.getScript(window.bootstrap.assetPath + '/js/es5-shims.js', function(){
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
  ctx.useCache = true;
  ctx.compact = this.getState('compact').toString() === 'true';

  return ctx;
}

function setTitle(props={}) {
  if (props.title) {
    $('title').text(props.title);
  }
}

function refreshToken (app, tries=0) {
  if (tries >= 3) {
    window.location = '/logout';
  }

  $.get('/oauth2/refresh').done(function(token) {
    app.setState('token', token.token);
    app.setState('tokenExpires', token.tokenExpires);

    var now = new Date();
    var expires = new Date(token.tokenExpires);

    window.setTimeout(function() {
      refreshToken(app);
    }, (expires - now) * .9);
  }).fail(function() {
    window.setTimeout(function() {
      refreshToken(app, tries + 1);
    }, 1000 * 10);
  });
}

function initialize(bindLinks) {
  $(function() {
    var plugin;
    var p;
    var $body = $('body');

    config.mountPoint = document.getElementById('app-container');

    _.forOwn(config, function(val, key) {
      if (bootstrap[key]) {
        config[key] = bootstrap[key];
      }
    });

    var app = new App(config);

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
        app.render(app.fullPathName(), false, modifyContext).then(function(props) {
          setTitle(props);
        });
      });

      $(window).on('popstate', function(e) {
        var href = app.fullPathName();
        // Work around some browsers firing popstate on initial load
        if (href !== initialUrl) {
          scrollCache[initialUrl] = window.scrollY;

          app.render(href, false, modifyContext).then(function(props) {
            if(scrollCache[href]) {
              $('html, body').animate({
                scrollTop: scrollCache[href],
              }, 0);
            }

            setTitle(props);
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

    app.on(constants.COMPACT_TOGGLE, function(compact) {
      app.setState('compact', compact);
    });

    window.addEventListener('scroll', _.throttle(function() {
        app.emit(constants.SCROLL);
      }.bind(app), 100));

    window.addEventListener('resize', _.throttle(function() {
        app.emit(constants.RESIZE);
      }.bind(app), 100));


    // Send the timings during the next cycle.
    setTimeout(function() {
      if (window.bootstrap.actionName) {
        var timings = getTimes();
        timings.actionName = 'm.server.' + window.bootstrap.actionName;

        $.ajax({
          type: 'POST',
          url: '/timings',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify({
            rum: timings,
            _csrf: $('#csrf-token-meta-tag').attr('content'),
          }),
        });
      }
    }, 1);
  });
}

module.exports = initialize;
