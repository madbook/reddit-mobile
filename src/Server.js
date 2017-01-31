import 'babel-polyfill';

import KoaStatic from 'koa-static';
import cluster from 'cluster';
import { cpus } from 'os';
import urlParser from 'url';
import Raven from 'raven';

import Server from '@r/platform/Server';
import { dispatchInitialShell } from '@r/platform/plugins';
import APIOptions from '@r/api-client';

import config from 'config';
import errorLog from 'lib/errorLog';
import routes from 'app/router';
import main from 'server/templates/main';
import reducers from 'app/reducers';
import reduxMiddleware from 'app/reduxMiddleware';
import ravenMiddleware from 'app/reduxMiddleware/raven';
import loginproxy from 'server/session/loginproxy';
import logoutproxy from 'server/session/logoutproxy';
import registerproxy from 'server/session/registerproxy';
import refreshproxy from 'server/session/refreshproxy';
import dispatchSession from 'server/session/dispatchSession';
import dispatchAPIPassThroughHeaders from 'server/initialState/dispatchAPIPassThroughHeaders';
import { dispatchInitialCompact } from 'server/initialState/dispatchInitialCompact';
import dispatchInitialEUCookieNotice from 'server/initialState/dispatchInitialEUCookieNotice';
import { dispatchInitialMeta } from 'server/initialState/dispatchInitialMeta';
import { dispatchInitialOver18 } from 'server/initialState/dispatchInitialOver18';
import { dispatchInitialTheme } from 'server/initialState/dispatchInitialTheme';

import {
  dispatchInitialRecentSubreddits,
} from 'server/initialState/dispatchInitialRecentSubreddits';

import { dispatchInitialUser } from 'server/initialState/dispatchInitialUser';
import metaRoutes from 'server/meta';
import statsRouterMiddleware from 'server/meta/stats';

import dispatchInitialCollapsedComments from
  'server/initialState/dispatchInitialCollapsedComments';

Raven
  .config(process.env.SENTRY_SERVER_PRIVATE_URL, {
    release: __GLOBALS__.release,
    captureUnhandledRejections: true,
    environment: process.env.NODE_ENV,
  })
  .install();

const buildFiles = KoaStatic('build');
const processes = process.env.PROCESSES || cpus().length;

// If we miss catching an exception, format and log it before exiting the
// process.
process.on('uncaughtException', function (error) {
  // errorLog will be console.logging the formatted output
  errorLog({
    error,
    userAgent: 'SERVER',
  }, {
    hivemind: config.statsURL,
  });

  process.exit();
});

// Log promise rejection events as well, these are likely to be errors
// in the api endpoints. Logging is better than 1x now that we're trying
// harder to parse the error location and get the stack
process.on('unhandledRejection', function(rejection) {
  // errorLog will be console.logging the formatted output
  errorLog({
    rejection,
    userAgent: 'SERVER',
  }, {
    hivemind: config.statsURL,
  });
});

// Note: shhh, some of these things have to be here and never in
// config.js because they're server only secrets.
const ConfigedAPIOptions = {
  ...APIOptions,
  origin: 'https://www.reddit.com',
  oauthAppOrigin: 'https://m.reddit.com',
  clientId: process.env.SECRET_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_SECRET,
  servedOrigin: process.env.ORIGIN || `http://localhost:${config.port}`,
  statsURL: config.statsURL,
  actionNameSecret: process.env.ACTION_NAME_SECRET,
};

export function startServer() {
  console.log(`Started server at PID ${process.pid}`);
  // Create and launch the server
  return Server({
    port: config.port,
    routes,
    template: main,
    reducers,
    reduxMiddleware: [ravenMiddleware(Raven)].concat(reduxMiddleware),
    dispatchBeforeNavigation: async (ctx, dispatch, getState) => {
      dispatchInitialShell(ctx, dispatch);
      dispatchAPIPassThroughHeaders(ctx, dispatch);
      await dispatchSession(ctx, dispatch, ConfigedAPIOptions);
      dispatchInitialTheme(ctx, dispatch);
      dispatchInitialCollapsedComments(ctx, dispatch);
      dispatchInitialCompact(ctx, dispatch);
      dispatchInitialMeta(ctx, dispatch);
      dispatchInitialEUCookieNotice(ctx, dispatch, getState);
      dispatchInitialOver18(ctx, dispatch);
      dispatchInitialRecentSubreddits(ctx, dispatch);
      await dispatchInitialUser(ctx, dispatch, getState);
    },
    preRouteServerMiddleware: [
      buildFiles,
      async (ctx, next) => {
        // This strategy recommended by node docs
        // https://nodejs.org/api/http.html#http_message_rawheaders
        ctx.orderedHeaders = ctx.req.rawHeaders.filter((_, i) => i % 2 === 0);
        await next();
      },
      async (ctx, next) => {
        await next();
        ctx.set('X-Frame-Options', 'SAMEORIGIN');
      },
      async (ctx, next) => {
        await next();
        const desktopPreferredCookie = ctx.cookies.get('mweb-no-redirect');
        if (parseInt(desktopPreferredCookie, 10) === 1) {
          const path = urlParser.parse(ctx.url).path;
          ctx.redirect(config.reddit + path);
        }
      },
    ],
    getServerRouter: router => {
      // middleware
      statsRouterMiddleware(router, ConfigedAPIOptions);

      // private routes for login, logout, register, and token refresh
      loginproxy(router, ConfigedAPIOptions);
      logoutproxy(router, ConfigedAPIOptions);
      registerproxy(router, ConfigedAPIOptions);
      refreshproxy(router, ConfigedAPIOptions);
      metaRoutes(router, ConfigedAPIOptions);
    },
  })();
}

export function workerExit(failedProcesses, worker) {
  if (failedProcesses < 20) {
    console.log(`Worker ${worker.process.pid} died, restarting.`);
    cluster.fork();
    failedProcesses++;
  } else {
    console.log('Workers died too many times, exiting.');
    process.exit();
  }
}

export function startCluster() {
  let failedProcesses = 0;

  cluster.setupMaster();

  for (let i = 0; i < processes; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => workerExit(failedProcesses, worker));
  cluster.on('exit', () => failedProcesses++);

  console.log(`Started cluster with ${processes} processes.`);
}

if (cluster.isMaster && processes > 1) {
  startCluster();
} else {
  startServer();
}
