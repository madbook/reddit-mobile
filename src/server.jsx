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

// The core
import oauthRoutes from './oauth';
import serverRoutes from './serverRoutes';
import routes from './routes';

import randomBySeed from './lib/randomBySeed'

function randomString(len) {
  var id = [];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; i++) {
    id.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }

  return id.join('');
}

function getBucket(loid, choices, controlSize) {
  return parseInt(loid.substring(loid.length - 4), 36) % 100;
}

function formatProps (props = {}) {
  delete props.apiOptions;
  return props;
}

function setExperiment(app, ctx, id, value) {
  let cookieOptions = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };

  ctx.cookies.set(id, value, cookieOptions);
  ctx.experiments.push({ id, value });
}

function skipAuth(app, url) {
  return (
    url.indexOf('/logout') === 0 ||
    url.indexOf('/login') === 0 ||
    url.indexOf('/register') === 0 ||
    url.indexOf('/oauth2') === 0 ||
    url.indexOf('/timings') === 0
  );
}

class Server {
  constructor (config) {
    // Intantiate a new App instance (React middleware)
    this.seed = Math.random();
    config.seed = this.seed;
    config.staticMarkup = true;
    config.experiments = config.experiments || [];

    var app = new App(config);

    app.config.renderTracking = true;

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

    server.use(this.checkToken(app));
    server.use(this.convertSession(app));
    server.use(this.setLOID(app));
    server.use(this.setExperiments(app));
    server.use(this.modifyRequest(app));
    server.use(this.setHeaders(app));

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
        this.loid = this.cookies.get('loid');
        this.loidcreated = this.cookies.get('loidcreated');

        // If user came from desktop, and is a new user, treat them as new for
        // experiments.
        if (this.query.ref_source === 'desktop') {
          let created = new Date(this.loidcreated);

          if (created.setMinutes(created.getMinutes() - 5) < Date.now()) {
            this.newUser = true;
          }
        }

        yield next;
        return;
      }

      let loggedOutId = randomString(18);
      let created = (new Date()).toISOString();

      var cookieOptions = {
        secure: app.getConfig('https'),
        secureProxy: app.getConfig('httpsProxy'),
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
      }

      this.loid = loggedOutId;
      this.loidcreated = created;

      this.newUser = true;
      this.cookies.set('loid', loggedOutId, cookieOptions);
      this.cookies.set('loidcreated', created, cookieOptions);

      yield next;
    }
  }

  setExperiments (app) {
    return function * (next) {
      if (!app.config.experiments) {
        yield next;
        return;
      }

      let bucket = getBucket(this.loid);
      this.experiments = [];

      if (app.config.experiments.fiftyfifty &&
          this.newUser &&
          !this.cookies.get('fiftyfifty')) {
        // divide by two, because there are two possible buckets, plus control
        let bucketSize = parseInt(app.config.experiments.fiftyfifty) / 2;

        if (bucket < bucketSize) {
          setExperiment(app, this, 'fiftyfifty', 'A');
        } else if (bucket < bucketSize * 2) {
          setExperiment(app, this, 'fiftyfifty', 'B');
        } else  {
          setExperiment(app, this, 'fiftyfifty', 'control');
        }
      } else if (this.cookies.get('fiftyfifty')) {
        this.experiments.push({
          id: 'fiftyfifty',
          value: this.cookies.get('fiftyfifty'),
        });
      }

      let compactCookieOptions = {
        secure: app.getConfig('https'),
        secureProxy: app.getConfig('httpsProxy'),
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
      };

      if (app.config.experiments.compactTest &&
          !this.cookies.get('compact') &&
          !this.cookies.get('compactTest')) {
        // divide by two, because there are two possible buckets, plus control
        let bucketSize = parseInt(app.config.experiments.compactTest) / 2;

        if (bucket < bucketSize) {
          this.cookies.set('compact', 'true', compactCookieOptions);
          setExperiment(app, this, 'compactTest', 'compact');
        } else if (bucket < bucketSize * 2) {
          this.cookies.set('compact', 'false', compactCookieOptions);
          setExperiment(app, this, 'compactTest', 'list');
        } else {
          setExperiment(app, this, 'compactTest', 'control');
        }
      } else if (this.cookies.get('compactTest')) {
        this.experiments.push({
          id: 'compactTest',
          value: this.cookies.get('compactTest'),
        });
      } else {
        this.cookies.set('compact', 'false', compactCookieOptions);
      }

      yield next;
      return;
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

      this.compact = compact;
      this.compactTest = this.cookies.get('compactTest');

      this.showBetaBanner = !this.cookies.get('hideBetaBanner');

      this.seed = app.config.seed;
      this.random = randomBySeed(this.seed);
      this.staticMarkup = true;

      this.body = this.request.body;
      this.userAgent = this.headers['user-agent'];

      if (!this.token) {
        this.token = this.cookies.get('token');
        this.tokenExpires = this.cookies.get('tokenExpires');

        if (!this.loid) {
          this.loid = this.cookies.get('loid');
          this.loidcreated = this.cookies.get('loidcreated');
        }
      }

      this.renderSynchronous = true;
      this.useCache = false;

      yield next;
    }
  }

  convertSession(app) {
    return function * (next) {
      if (skipAuth(app, this.url)) {
        yield next;
        return;
      }

       let session = this.cookies.get('reddit_session');

      if (!this.token &&
          !this.cookies.get('token') &&
          this.cookies.get('reddit_session')) {

        try {
          var token = yield app.convertSession(this, session);

          this.token = token.token.access_token;
          this.tokenExpires = token.token.expires_at.toString();

          app.setTokenCookie(this, token);
        } catch (e) {
          this.cookies.set('tokenExpires');
          this.cookies.set('token');
          this.cookies.set('refreshToken');
          this.cookies.set('reddit_session', undefined, {
            domain: '.reddit.com',
          });
          this.redirect('/');
          return;
        }

        yield next;
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

      if (skipAuth(app, this.url)) {
        yield next;
        return;
      }

      expires = new Date(expires);

      if (now > expires) {
        var rToken = this.cookies.get('refreshToken');

        try {
          var token = yield app.refreshToken(this, rToken);

          this.token = token.token.access_token;
          this.tokenExpires = token.token.expires_at.toString();

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
