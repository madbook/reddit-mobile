import React from 'react';

// The base routes
import routes from './routes';
import redirects from './redirects';

// Import the api instance; we're going to share an instance between the
// plugins.
import { v1 as V1Api } from 'snoode';

import BodyLayout from './views/layouts/BodyLayout';
import ErrorPage from './views/pages/error';

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

      routes(this);
      redirects(this);
    }

    error (e, ctx, app) {
      if (app.config.debug) {
        console.log(e, e.stack);
      }

      // API error
      if (e.status) {
        if (ctx.token && e.status === 401) {
          // Improper token or does not have access.
          // Should be a refresh token instead of a login redirect, but this
          // will at least fix issues for currently logged-in users.
          // TODO: change to refresh
          return ctx.redirect(app.config.loginPath);
        } else if (e.status === 403) {
          // Missing authorization
          return ctx.redirect(app.config.loginPath);
        }
      }

      ctx.body = this.errorPage(ctx, e.status);
    }

    safeStringify (obj) {
      return JSON.stringify(obj)
        .replace(/&/g, '\\u0026')
        .replace(/</g, '\\u003C')
        .replace(/>/g, '\\u003E');
    }

    getUser (ctx) {
      if (!ctx.token) { return Promise.reject('No token'); }
      var app = this;

      if (this.state && this.state.user){
        return Promise.resolve(this.state.user);
      }

      return new Promise(function(resolve, reject) {
        var origin = app.getConfig('authAPIOrigin');

        var apiOptions =  {
          origin: origin,
          headers: {
            'Authorization': `bearer ${ctx.token}`,
            'user-agent': ctx.headers['user-agent'],
          }
        };

        var options = app.api.buildOptions(apiOptions);
        options.user = 'me';

        try {
          app.api.users.get(options).then(function(user) {
            if (app.setState) {
              app.setState('user', user);
            }

            resolve(user);
          }, function(error) {
            reject(error);
          });
        } catch (e) {
          reject(e);
        }
      });
    }

    getUserSubscriptions (ctx, getDefaults) {
      var app = this;

      if (this.getState && this.getState('userSubscriptions')){
        return Promise.resolve(this.getState('userSubscriptions'));
      }

      return new Promise(function(resolve, reject) {
        var sort = 'default';

        if (ctx.token && !getDefaults) {
          var origin = app.getConfig('authAPIOrigin');

          var apiOptions =  {
            origin: origin,
            headers: {
              'Authorization': `bearer ${ctx.token}`,
            }
          };

          sort = 'mine/subscriber';
        } else {
          var origin = app.getConfig('nonAuthAPIOrigin');

          var apiOptions =  {
            origin: origin,
          };
        }

        var options = app.api.buildOptions(apiOptions);

        options.headers['user-agent'] = ctx.headers['user-agent'];

        options.query.sort = sort;
        options.query.sr_detail = true;
        options.query.feature = 'mobile_settings';
        options.query.limit = 250;

        try {
          app.api.subreddits.get(options).then(function(subreddits) {
            if (subreddits.length > 0) {
              var subs = subreddits.map(formatSubreddit);

              if (app.setState) {
                app.setState('userSubscriptions', subs);
              }

              resolve(subs);
            } else {
              app.getUserSubscriptions(ctx, true).then(function(subreddits) {
                resolve(subreddits);
              });
            }
          }, function(error) {
            reject(error);
          });
        } catch (e) {
          reject(e);
        }
      });
    }

    getUserPrefs (ctx, bustCache) {
      if (!ctx.token) { return Promise.reject('No token'); }
      var app = this;

      if (this.getState && this.getState('userPrefs')){
        return Promise.resolve(this.getState('userPrefs'));
      }

      return new Promise(function(resolve, reject) {
        var origin = app.getConfig('authAPIOrigin');

        var apiOptions =  {
          origin: origin,
          headers: {
            'Authorization': `bearer ${ctx.token}`,
            'user-agent': ctx.headers['user-agent'],
          }
        };

        var options = app.api.buildOptions(apiOptions);

        try {
          app.api.preferences.get(options).then(function(prefs) {
            if (app.getState) {
              app.setState('userPrefs', prefs);
            }

            resolve(prefs);
          }, function(error) {
            reject(error);
          });
        } catch (e) {
          reject(e);
        }
      });
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
          <BodyLayout {...props}>
            <ErrorPage {...props}/>
          </BodyLayout>
        );
      }
    }
  }

  return MixedInApp;
}

export default mixin;
