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
import StatsdClient from 'statsd-client';

import { ServerReactApp } from 'horse-react';
import mixin from '../app-mixin';

var App = mixin(ServerReactApp);

// The core
import constants from '../constants';
import globals from '../globals';
import oauthRoutes from './oauth';
import serverRoutes from './routes';
import routes from '../routes';

import randomBySeed from '../lib/randomBySeed'
import setLoggedOutCookies from '../lib/loid';

import defaultConfig from '../config';

const ignoreCSRF = ['/timings'];

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

function setCompact(ctx, app) {
  if (ctx.compact !== undefined) {
    return;
  }

  let compact = (ctx.cookies.get('compact') || '').toString() === 'true';

  let cookieOptions = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };

  let ua = ctx.headers['user-agent'];

  // Set compact for opera mini
  if (ua.match(/(opera mini|android 2)/i)) {
    compact = true;
  }

  if (ctx.query.compact === 'true') {
    compact = true;
  } else if (ctx.query.compact === 'false') {
    compact = false;
  }

  if (compact) {
    ctx.cookies.set('compact', compact, cookieOptions);
  } else if (ctx.cookies.get('compact') === 'false') {
    ctx.cookies.set('compact');
  }

  ctx.compact = compact;
}

function formatBootstrap(props) {
  var config = defaultConfig();

  for (var p in props.config) {
    if (!config.hasOwnProperty(p)){
      delete props.config[p];
    }
  }

  return props;
}

class Server {
  constructor (config) {
    this.activeRequests = 0;

    // Intantiate a new App instance (React middleware)
    config.seed = Math.random();
    config.staticMarkup = true;
    config.experiments = config.experiments || [];
    config.formatBootstrap = formatBootstrap;

    var app = new App(config);

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

    this.statsd = new StatsdClient(config.statsd || {
      _socket:  { send: ()=>{}, close: ()=>{}  }
    });

    let that = this;
    server.use(function * (next) {
      let statsd = that.statsd;

      that.activeRequests++;

      statsd.increment('request');

      yield next;
      that.activeRequests--;

      statsd.increment(`response.${this.status}`);

      if (this.props && this.props.timings) {
        if (this.props.timings.route) {
          statsd.timing('timings.route', this.props.timings.route);
        }

        if (this.props.timings.render) {
          statsd.timing('timings.render',  this.props.timings.render);
        }

        if (this.props.timings.data) {
          statsd.timing('timings.data',  this.props.timings.data);
        }
      }
    });

    // Runs after everything else, making sure private
    // responses don't get cached.
    server.use(this.cacheGuard());

    server.use(session(server, sessionOptions));
    server.use(compress());
    server.use(bodyParser());

    csrf(server);
    server.use(this.csrf(app));

    // Set up static routes for built (and unbuilt, static) files
    server.use(koaStatic(__dirname + '/../../build'));

    server.use(this.checkToken(app));
    server.use(this.convertSession(app));
    server.use(this.setLOID(app));
    server.use(this.setExperiments(app));
    server.use(this.modifyRequest(app));
    server.use(this.setHeaders(app));

    server.use(App.serverRender(app, formatProps));

    server.use(this.fatalError(app));

    this.server = server;
    this.app = app;

    this.logStats();
  }

  logStats () {
    setTimeout(() => {
      this.app.emit('log:activeRequests', this.activeRequests);
      this.logStats();
    }, 1000);
  }

  fatalError(app) {
    return function * (next) {
      // If there is no body and it's not a redirect, log out an error
      if (!this.body && !(parseInt(this.status / 100) === 3)) {
        app.error('Fatal error', this, app, {
          replaceBody: false,
          redirect: false,
        });

        this.body = 'Internal server error.';
        this.status = 500;
      }
    }
  }

  csrf (app) {
    return function * (next) {
      if (['GET', 'HEAD', 'OPTIONS'].includes(this.method)) {
        return yield* next;
      }

      if (ignoreCSRF.includes(this.url)) {
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
      if (!this.cookies.get('loid')) {
        let cookies = setLoggedOutCookies(this.cookies, app);

        // koa doesn't return cookies set within the
        // same request, cache it for later
        this._loid = cookies.loid;
      }

      yield next;
      return;
    };
  }

  setExperiments (app) {
    return function * (next) {
      if (!app.config.experiments) {
        yield next;
        return;
      }

      let loid = this.cookies.get('loid');

      if (loid) {
        // If user came from desktop, and is a new user, treat them as new for
        // experiments.
        if (this.query.ref_source === 'desktop') {
          let created = new Date(this.cookies.get('loidcreated'));

          if (created.setMinutes(created.getMinutes() - 5) < Date.now()) {
            this.newUser = true;
          }
        }
      } else {
        loid = this._loid;

        this.newUser = true;
      }

      let bucket = getBucket(loid);
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

      // Don't cache if logged-in
      if (this.cookies.get('token')) {
        this.set('Cache-Control', 'private, no-cache');
      }

      yield next;
    }
  }

  cacheGuard (app) {
    return function * (next) {

      yield next;

      var cookieHeaders = this.res.getHeader('Set-Cookie') || [];
      var setUncacheableCookie = false;
      cookieHeaders.forEach(c => {
        c = c.split(/=/)[0];
        // this isn't a cacheable cookie or its signature cookie?
        if (!constants.CACHEABLE_COOKIES.find(x => (x == c || x + '.sig' == c))) {
          // the response can't be cached, then
          this.set('Cache-Control', 'private, no-cache');
        }
      });
    }
  }



  modifyRequest (app) {
    return function * (next) {
      setCompact(this, app);

      globals().random = randomBySeed(app.config.seed);
      this.staticMarkup = true;

      this.body = this.request.body;
      this.userAgent = this.headers['user-agent'];

      if (!this.token) {
        this.token = this.cookies.get('token');
        this.tokenExpires = this.cookies.get('tokenExpires');
      }

      this.showOver18Interstitial = !this.cookies.get('over18') || this.cookies.get('over18') === 'false';

      this.renderSynchronous = true;
      this.useCache = false;

      this.isGoogleCrawler = this.userAgent.toLowerCase().indexOf('googlebot') > -1;

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
          session) {

        try {
          var token = yield app.convertSession(this, session);

          this.token = token.token.access_token;
          this.tokenExpires = token.token.expires_at.toString();

          app.setTokenCookie(this, token);
        } catch (e) {
          app.error(e, this, app, { redirect: false, replaceBody: false });
        }

        yield next;
      }

      yield next;
    }
  }

  checkToken (app) {
    return function * (next) {
      if (skipAuth(app, this.url)) {
        yield next;
        return;
      }

      var now = new Date();
      var expires = this.cookies.get('tokenExpires');

      expires = new Date(expires);

      if (now > expires) {
        var rToken = this.cookies.get('refreshToken');

        try {
          var token = yield app.refreshToken(this, rToken);

          this.token = token.token.access_token;
          this.tokenExpires = token.token.expires_at.toString();

          app.setTokenCookie(this, token);
        } catch (e) {
          app.error(e, this, app, { redirect: false, replaceBody: false });

          app.nukeTokens(this);
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
}

export default Server;
