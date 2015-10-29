import React from 'react';

// The base routes
import redirects from './redirects';

// Import the api instance; we're going to share an instance between the
// plugins.
import { v1 as V1Api } from 'snoode';

import BodyLayout from './views/layouts/BodyLayout';
import ErrorPage from './views/pages/error';
import Loading from './views/components/Loading';

import errorLog from './lib/errorLog';

function logError(err, ctx, config) {
  var userAgent;
  var url;
  var line;

  if (err.stack) {
    url = err.stack.split('\n')[1];
  }

  if (ctx && ctx.env === 'SERVER' || process) {
    userAgent = 'SERVER';

    if (ctx && ctx.headers['user-agent']) {
      userAgent += '-' + ctx.headers['user-agent'];
    }
  } else if (ctx) {
    userAgent = ctx.headers['user-agent'];
  }

  errorLog({
    error: err,
    userAgent: userAgent,
    message: err.message,
    line: line,
    url: url,
    requestUrl: ctx ? ctx.path : null,
  }, {
    hivemind: config.statsDomain,
  }, {
    level: config.debugLevel || 'error',
  });
}

const errorMsgMap = {
  '404': 'Sorry, that page doesn\'t seem to exist.',
  '403': 'Sorry, you don\'t have access to this.',
  '503': 'Sorry, we are having trouble communicating with reddit\'s servers.',
  'default': 'Oops, looks like something went wrong.',
};


function formatSubreddit(s) {
  return {
    icon: s.icon,
    display_name: s.display_name,
    url: s.url,
    submit_text: s.submit_text,
  }
}

function mixin (App) {
  class MixedInApp extends App {
    constructor (config={}) {
      super(config)

      // Set up two APIs (until we get non-authed oauth working).
      this.api = new V1Api({
        defaultHeaders: this.config.apiHeaders,
      });

      redirects(this);
    }

    error (e, ctx, app, options={}) {
      // API error
      if (e.status) {
        // Don't redirect if abort === false
        if (!ctx.token && e.status === 403 && options.redirect !== false) {
          // Missing authorization
          return ctx.redirect(app.config.loginPath);
        }
      }

      logError(e, ctx, app.config);

      if (options.replaceBody !== false) {
        ctx.body = this.errorPage(ctx, e.status);
        app.emit('error:body', ctx);
      }
    }

    safeStringify (obj) {
      return JSON.stringify(obj)
        .replace(/&/g, '\\u0026')
        .replace(/</g, '\\u003C')
        .replace(/>/g, '\\u003E');
    }

    errorPage(ctx, statusCode) {
      var statusMsg = errorMsgMap[statusCode] || errorMsgMap['default'];

      if (!isNaN(parseInt(statusCode))) {
        ctx.status = parseInt(statusCode);
      } else {
        ctx.status = 503;
      }

      Object.assign({}, ctx.props || {}, {
        title: statusMsg,
        status: ctx.status,
        originalUrl: ctx.originalUrl || '/',
      });

      return function(props) {
        return (
          <BodyLayout {...props} key='error'>
            <ErrorPage {...props}/>
          </BodyLayout>
        );
      }
    }

    loadingpage (props) {
      return (
        <Loading />
      );
    }
  }

  return MixedInApp;
}

export default mixin;
