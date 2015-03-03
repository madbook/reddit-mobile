import $ from 'jquery';
global.jQuery = global.$ = $;

import querystring from 'querystring';

import q from 'q';

import 'bootstrap';
import attachFastClick from 'fastclick';

import {ClientReactApp} from 'horse-react';
import mixin from '../../src/app-mixin';

ClientReactApp = mixin(ClientReactApp);

import config from '../../src/config';
import plugins from '../../src/plugins';

import TweenLite from 'gsap';

// A few es5 sanity checks
if (!Object.create || !Array.prototype.map || !Object.freeze) {
  $.getScript('/js/es5-shims.js', function(){
    initialize(false);
  })
} else {
  initialize(true);
}

function fullPathName () {
  return document.location.pathname + document.location.search;
}

function initialize(bindLinks) {
  // Null this out, or errors everywhere
  config.userAgent = undefined;

  $(function() {
    var plugin;
    var p;
    var $body = $('body');

    config.mountPoint = document.getElementById('app-container');

    var app = new ClientReactApp(config);

    if (plugins) {
      for (p in plugins) {
        plugin = plugins[p];
        plugin.register(app);
      }
    }

    var history = window.history || window.location.history;

    var initialUrl = fullPathName();
    attachFastClick(document.body);

    if(history && bindLinks) {
      $body.on('click', 'a', function(e) {
        var $link = $(this);
        var href = $link.attr('href');
        var currentUrl = fullPathName();

        // If it has a target=_blank, or an 'external' data attribute, or it's
        // an absolute url, let the browser route rather than forcing a capture.
        if (
          ($link.attr('target') || $link.attr('data-no-route')) ||
          href.indexOf('//') > -1
        ) {
          return;
        }

        e.preventDefault();

        if (href.indexOf('#') === 0) {
          return;
        }

        initialUrl = href;

        history.pushState(null, null, href);

        // Set to the browser's interpretation of the current name (to make
        // relative paths easier), and send in the old url.
        app.render(fullPathName());
      });

      $(window).on('popstate', function(e) {
        // Work around some browsers firing popstate on initial load
        if (fullPathName() !== initialUrl) {
          initialUrl = fullPathName();
          app.render(fullPathName());
        }
      });
    }

    app.render(fullPathName(), true);
  });
}

module.exports = initialize;
