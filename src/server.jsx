// The HTTP server configuration.
// This is the only code (besides gulpfile / index) that is *not* run on the
// client.

import co from 'co';

// server and middleware
import koa from 'koa';
import koaStatic from 'koa-static';
import bodyParser from 'koa-bodyparser';
import csrf from 'koa-csrf';
import compress from 'koa-compress';

import session from 'koa-session';

import { ServerReactApp } from 'horse-react';
import mixin from './app-mixin';

var App = mixin(ServerReactApp);

// Plugins
import plugins from './plugins';

// The core
import oauthRoutes from './oauth';
import serverRoutes from './serverRoutes';
import routes from './routes';

function randomString(len) {
  var id = [];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; i++) {
    id.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }

  return id.join('');
}

function formatProps (props = {}) {
  delete props.apiOptions;
  return props;
}

class Server {
  constructor (config) {
    // Intantiate a new App instance (React middleware)
    var app = new App(config);

    app.config.renderTracking = true;

    var plugin, p;

    if (plugins) {
      for (p in plugins) {
        plugin = plugins[p];
        plugin.register(app);
      }
    }

    oauthRoutes(app);
    serverRoutes(app);
    routes(app);

    var server = koa();
    server.keys = config.keys;

    // tell koa-session what security settings to use for the session cookie
    var sessionOptions = {
        secure: config.https,
        secureProxy: config.httpsProxy
    };

    server.use(session(server, sessionOptions));
    server.use(compress());
    server.use(bodyParser());

    csrf(server);
    server.use(this.csrf(app));

    // Set up static routes for built (and unbuilt, static) files
    server.use(koaStatic(__dirname + '/../build'));

    server.use(this.modifyRequest(app));
    server.use(this.setHeaders(app));
    server.use(this.setLOID(app));
    server.use(this.checkToken(app));

    server.use(App.serverRender(app, formatProps));

    this.server = server;
    this.app = app;
  }

  csrf (app) {
    return function * (next) {
      if (['GET', 'HEAD', 'OPTIONS'].includes(this.method)) {
        return yield* next;
      }

      try {
        this.assertCSRF(this.request.body)
        yield next;
      } catch (e) {
        this.redirect('/?error=invalid_token');
      }
    }
  }

  setLOID (app) {
    return function * (next) {
      if (this.cookies.get('loid')) {
        yield next;
        return;
      }

      var loggedOutId = randomString(18);
      var created = (new Date()).toISOString();

      var cookieOptions = {
        secure: app.getConfig('https'),
        secureProxy: app.getConfig('httpsProxy'),
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
      }

      this.cookies.set('loid', loggedOutId, cookieOptions);
      this.cookies.set('loidcreated', created, cookieOptions);

      yield next;
    }
  }

  setHeaders (app) {
    return function * (next) {
      this.set('X-Frame-Options', 'SAMEORIGIN');
      this.set('X-Content-Type-Options', 'nosniff');
      this.set('X-XSS-Protection', '1; mode=block');

      if (app.config.https || app.config.httpsProxy) {
        this.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      if (this.cookies.get('token')) {
        this.set('Cache-control', 'no-cache');
      }

      yield next;
    }
  }

  modifyRequest (app) {
    return function * (next) {
      var compact = this.cookies.get('compact') === 'true' ||
                    this.cookies.get('compact') === true;

      var cookieOptions = {
        secure: app.getConfig('https'),
        secureProxy: app.getConfig('httpsProxy'),
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
      }

      if (this.query.compact === 'on') {
        this.cookies.set('compact', true, cookieOptions);
        compact = true;
      } else if (this.query.compact === 'off') {
        this.cookies.set('compact', false, cookieOptions);
        compact = false;
      }

      this.showBetaBanner = !this.cookies.get('hideBetaBanner');

      this.body = this.request.body;
      this.userAgent = this.headers['user-agent'];

      this.token = this.cookies.get('token');
      this.tokenExpires = this.cookies.get('tokenExpires');

      this.compact = compact;

      this.renderSynchronous = true;
      this.useCache = false;

      if (!this.token) {
        this.loid = this.cookies.get('loid');
        this.loidcreated = this.cookies.get('loidcreated');
      }

      yield next;
    }
  }

  checkToken (app) {
    return function * (next) {
      var now = new Date();
      var expires = this.cookies.get('tokenExpires');

      if (!expires) {
        yield next;
        return;
      }

      expires = new Date(expires);

      if (now > expires) {
        var rToken = this.cookies.get('refreshToken');

        try {
          var token = yield app.refreshToken(this, rToken);
          app.setTokenCookie(this, token);
        } catch (e) {
          this.cookies.set('tokenExpires');
          this.cookies.set('token');
          this.cookies.set('refreshToken');
          this.redirect('/');
          return;
        }
      }

      yield next;
      return;
    }
  }

  start () {
    // Listen to a port and shout it to the world.
    this.server.listen(this.app.config.port);
  }

  static info (config) {
    console.log(`listening on ${config.port} on ${config.processes} processes.`);

    if (config.keys.length === 1 && config.keys[0] === 'lambeosaurus') {
      console.warn('WARNING: Using default security keys.');
    }
  }
}

export default Server;
