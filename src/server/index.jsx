// The HTTP server configuration.
// This is the only code (besides gulpfile / index) that is *not* run on the
// client.

// server and middleware
import 'babel-polyfill';
import koa from 'koa';
import koaStatic from 'koa-static';
import bodyParser from 'koa-bodyparser';
import csrf from 'koa-csrf';
import compress from 'koa-compress';
import urlParser from 'url';

import koasession from 'koa-session';
import StatsdClient from 'statsd-client';

import ServerReactApp from '@r/horse-react/src/server';
import mixin from '../app-mixin';

const App = mixin(ServerReactApp);

// The core
import constants from '../constants';
import oauthRoutes from './oauth';
import serverRoutes from './routes';
import routes from '../routes';
import {
  clearSessionCookies,
  getSession,
  setSessionCookies,
} from './session';

import setLoggedOutCookies from '../lib/loid';

import Config from '../config';

const ignoreCSRF = ['/timings', '/error', '/csp-report'];

const { NIGHTMODE, DAYMODE } = constants.themes;

function getBucket(loid) {
  return parseInt(loid.substring(loid.length - 4), 36) % 100;
}

function formatProps (props = {}) {
  delete props.apiOptions;
  return props;
}

function setExperiment(app, ctx, id, value) {
  ctx.cookies.set(id, value, makeCookieOptions(app));
  ctx.experiments.push({ id, value });
}

function skipAuth(app, url) {
  return (
    url.indexOf('/logout') === 0 ||
    url.indexOf('/login') === 0 ||
    url.indexOf('/register') === 0 ||
    url.indexOf('/oauth2') === 0 ||
    url.indexOf('/timings') === 0 ||
    url.indexOf('/error') === 0 ||
    url.indexOf('/csp-report') === 0
  );
}

function makeCookieOptions(app) {
  return {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };
}

function setTheme(ctx, app) {
  if (ctx.theme !== undefined) {
    return;
  }

  let theme = (ctx.cookies.get('theme') || '').toString() === NIGHTMODE
    ? NIGHTMODE : DAYMODE;

  if ([NIGHTMODE, DAYMODE].includes(ctx.query.theme)) {
    theme = ctx.query.theme;
  }

  if (theme === NIGHTMODE) {
    ctx.cookies.set('theme', theme, makeCookieOptions(app));
  } else {
    ctx.cookies.set('theme');
  }

  ctx.theme = theme;
}

function setCompact(ctx, app) {
  if (ctx.compact !== undefined) {
    return;
  }

  let compact = (ctx.cookies.get('compact') || '').toString() === 'true';

  const cookieOptions = makeCookieOptions(app);

  const ua = (ctx.headers['user-agent'] || '').toLowerCase();

  // Set compact for opera mini
  if (ua && ua.match(/(opera mini|android 2)/i)) {
    compact = true;
  }

  if (ctx.query.compact === 'true') {
    compact = true;
  } else if (ctx.query.compact === 'false') {
    compact = false;
  }

  if (compact) {
    ctx.cookies.set('compact', compact, cookieOptions);
  } else {
    ctx.cookies.set('compact');
  }

  ctx.compact = compact;
}

// Save a static reference to the config object at startup
const defaultConfig = Config;
function formatBootstrap(props) {
  let p;

  for (p in props.config) {
    if (!defaultConfig.hasOwnProperty(p)) {
      delete props.config[p];
    }
  }

  props.nonce = props.ctx.csrf;

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

    const app = new App(config);

    oauthRoutes(app);
    serverRoutes(app, this);
    routes(app);

    const server = koa();
    server.keys = config.keys;

    // tell koa-session what security settings to use for the session cookie
    const sessionOptions = {
      secure: config.https,
      secureProxy: config.httpsProxy,
    };

    this.statsd = new StatsdClient(config.statsd || {
      _socket: { send: ()=>{}, close: ()=>{} },
    });

    const that = this;
    server.use(function * (next) {
      const statsd = that.statsd;

      that.activeRequests++;

      statsd.increment('request');

      try {
        yield next;
      } catch (e) {
        app.error(e, this, app, {
          replaceBody: false,
          redirect: false,
        });
      }

      that.activeRequests--;

      statsd.increment(`response.${this.status}`);

      if (this.props && this.props.timings) {
        if (this.props.timings.route) {
          statsd.timing('timings.route', this.props.timings.route);
        }

        if (this.props.timings.render) {
          statsd.timing('timings.render', this.props.timings.render);
        }

        if (this.props.timings.data) {
          statsd.timing('timings.data', this.props.timings.data);
        }
      }
    });

    // Runs after everything else, making sure private
    // responses don't get cached.
    server.use(this.cacheGuard());

    server.use(koasession(server, sessionOptions));
    server.use(compress());
    server.use(bodyParser());

    csrf(server);
    server.use(this.csrf(app));

    if (!config.assetPath) {
      // Set up static routes for built (and unbuilt, static) files
      server.use(koaStatic(`${__dirname}/../../build`));
    }

    // these first two yield first _before_ taking action, so they are ordered
    // in "reverse" and at the top;
    server.use(this.setExperiments(app));
    server.use(this.setLOID(app));

    // these do work first before yielding.
    server.use(this.checkForDesktopRedirect(app));
    server.use(this.checkToken(app));
    server.use(this.convertSession(app));
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
    return function * () {
      // If there is no body and it's not a redirect, log out an error
      if (!this.body && !(parseInt(this.status / 100) === 3)) {
        app.error('Fatal error', this, app, {
          replaceBody: false,
          redirect: false,
        });

        this.body = 'Internal server error.';
        this.status = 500;
      }
    };
  }

  csrf () {
    return function * (next) {
      if (['GET', 'HEAD', 'OPTIONS'].includes(this.method)) {
        return yield* next;
      }

      if (ignoreCSRF.includes(this.url)) {
        return yield* next;
      }

      try {
        this.assertCSRF(this.request.body);
        yield next;
      } catch (e) {
        this.redirect('/?error=invalid_token');
      }
    };
  }

  setLOID (app) {
    return function * (next) {
      // default the loids. these may remain as defaults if the user curls our
      // health check endpoint, or if they crawl as a bot
      this.loid = '';
      this.loidcreated = (new Date()).toISOString();

      // if we have loid cookies, set them on the context. certain actions will
      // depend on these preliminary loids. if they are wrong, they will get
      // get corrected by the api
      const loid = this.cookies.get('loid');

      if (loid) {
        this.loid = loid;
        this.loidcreated = this.cookies.get('loidcreated');
      }

      // yield first, allowing the route to get handled. Then, pull data out
      // and use it to set the loid cookie
      yield next;

      // we might have gotten a new loid from the api after the route got
      // handled. if so, we want to use that here.
      if (this.props && this.props.loid) {
        this.loid = this.props.loid;
        this.loidcreated = this.props.loidcreated;
        setLoggedOutCookies(this.cookies, app, this.props.loid, this.props.loidcreated);
      }

      return;
    };
  }

  setExperiments (app) {
    return function * (next) {
      if (!app.config.experiments) {
        yield next;
        return;
      }

      // yield first since the route handling might set loids
      yield next;

      let loid = this.loid;

      if (loid) {
        // If user came from desktop, and is a new user, treat them as new for
        // experiments.
        if (this.query.ref_source === 'desktop') {
          const created = new Date(this.cookies.get('loidcreated'));

          if (created.setMinutes(created.getMinutes() - 5) < Date.now()) {
            this.newUser = true;
          }
        }
      } else {
        this.newUser = true;
      }

      const bucket = getBucket(loid);
      this.experiments = [];

      if (app.config.experiments.fiftyfifty &&
          this.newUser &&
          !this.cookies.get('fiftyfifty')) {
        // divide by two, because there are two possible buckets, plus control
        const bucketSize = parseInt(app.config.experiments.fiftyfifty) / 2;

        if (bucket < bucketSize) {
          setExperiment(app, this, 'fiftyfifty', 'A');
        } else if (bucket < bucketSize * 2) {
          setExperiment(app, this, 'fiftyfifty', 'B');
        } else {
          setExperiment(app, this, 'fiftyfifty', 'control');
        }
      } else if (this.cookies.get('fiftyfifty')) {
        this.experiments.push({
          id: 'fiftyfifty',
          value: this.cookies.get('fiftyfifty'),
        });
      }

      return;
    };
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
    };
  }

  cacheGuard () {
    return function * (next) {

      yield next;

      const cookieHeaders = this.res.getHeader('Set-Cookie') || [];
      cookieHeaders.forEach(c => {
        c = c.split(/=/)[0];
        // this isn't a cacheable cookie or its signature cookie?
        if (!constants.CACHEABLE_COOKIES.find(x => ([x, `${x}.sig`].includes(c)))) {
          // the response can't be cached, then
          this.set('Cache-Control', 'private, no-cache');
        }
      });
    };
  }

  modifyRequest (app) {
    return function * (next) {
      setCompact(this, app);
      setTheme(this, app);

      this.staticMarkup = true;
      this.env = 'SERVER';

      this.body = this.request.body;
      this.userAgent = this.headers['user-agent'] || '';
      this.country = this.headers['cf-ipcountry'] || defaultConfig.defaultCountry;
      this.notifications = (this.cookies.get('notifications') || '').split(',');

      // reset notifications after read
      this.cookies.set('notifications');

      // default to false so we only render this on the client.
      this.showGlobalMessage = false;
      this.showEUCookieMessage = false;
      this.showOver18Interstitial = !this.cookies.get('over18') ||
                                    this.cookies.get('over18') === 'false';

      this.renderSynchronous = true;
      this.useCache = false;

      yield next;
    };
  }

  convertSession(app) {
    return function * (next) {
      if (skipAuth(app, this.url)) {
        yield next;
        return;
      }

      const session = this.cookies.get('reddit_session');

      if (!this.redditSession &&
          !this.cookies.get('token') &&
          session) {

        try {
          const session = yield app.convertSession(this, session);
          this.redditSession = session;
          setSessionCookies(this, session);
        } catch (e) {
          app.error(e, this, app, { redirect: false, replaceBody: false });
        }

        yield next;
      }

      yield next;
    };
  }

  checkForDesktopRedirect (app) {
    return function * (next) {
      // This cookie name is a little confusing since it's a vestige of a
      // desktop experiment. This is saying, "don't redirect to mweb from
      // desktop". From mweb's perspective, if this is true, we want to
      // redirect to desktop.
      const noMweb = this.cookies.get('mweb-no-redirect');
      const url = urlParser.parse(this.request.href);
      const subdomain = url.host.split('.')[0];
      if (noMweb && subdomain === 'm') {
        const desktopUrl = app.config.reddit + url.path;
        this.redirect(desktopUrl);
        return;
      }
      yield next;
    };
  }

  checkToken (app) {
    return function * (next) {
      if (skipAuth(app, this.url)) {
        yield next;
        return;
      }

      const session = getSession(this);
      if (!session) {
        yield next;
        return;
      }

      // We need to make sure this token is fresh enough to fetch data.
      // This token _might_ just about be up for expiration and/or the
      // api could be under load. To compensate we should refresh
      // our token if we're within some padding of the expiration.
      const expires = new Date(session.expires);
      expires.setMinutes(expires.getMinutes() - 2);
      if (new Date() < expires) {
        this.redditSession = session;
        yield next;
        return;
      }

      // Our cookie is stale, let's bake a new one
      try {
        const freshSession = yield app.refreshSession(this, session.refreshToken);
        this.redditSession = freshSession;
        setSessionCookies(this, freshSession);
        yield next;
      } catch (e) {
        // if the refresh endpoint fails, there's not much we can do
        // womp womp
        clearSessionCookies(this);
        app.error(e, this, app, { redirect: false, replaceBody: false });
        this.redirect('/');
      }
    };
  }

  start () {
    // Listen to a port and shout it to the world.
    this.server.listen(this.app.config.port);
  }
}

export default Server;
