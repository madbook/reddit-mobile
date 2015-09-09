import { EventEmitter } from 'events';

// The base routes
import routes from './routes';
import redirects from './redirects';

// Import the api instance; we're going to share an instance between the
// plugins.
import { v1 as V1Api } from 'snoode';

function mixin (App) {
  class MixedInApp extends App {
    constructor (config={}) {
      super(config)

      // Set up two APIs (until we get non-authed oauth working).
      this.api = new V1Api({
        defaultHeaders: this.config.apiHeaders,
      });

      redirects(this);
      routes(this);
    }

    error (e, ctx, app) {
      // API error
      if (e.statusCode) {
        if (ctx.token && e.statusCode === 401) {
          // Improper token or does not have access.
          // Should be a refresh token instead of a login redirect, but this
          // will at least fix issues for currently logged-in users.
          // TODO: change to refresh
          ctx.redirect(app.config.loginPath);
        } else if (e.statusCode === 403) {
          // Missing authorization
          ctx.redirect(app.config.loginPath);
        }
      } else {
        super.error(e, ctx, app);
      }
    }

    safeStringify (obj) {
      return JSON.stringify(obj)
        .replace(/&/g, '\\u0026')
        .replace(/</g, '\\u003C')
        .replace(/>/g, '\\u003E');
    }
  }

  return MixedInApp;
}

export default mixin;
