import 'babel-polyfill';
import Server from '@r/platform/server';
import APIOptions from '@r/api-client';
import KoaStatic from 'koa-static';

import cluster from 'cluster';
import { cpus } from 'os';

import routes from 'app/router';
import main from 'server/templates/main';
import allReducers from 'app/reducers';
import loginproxy from 'server/session/loginproxy';
import logoutproxy from 'server/session/logoutproxy';
import refreshproxy from 'server/session/refreshproxy';
import dispatchSession from 'server/session/dispatchSession';
import { dispatchInitialCompact } from 'server/initialState/dispatchInitialCompact';
import { dispatchInitialTheme } from 'server/initialState/dispatchInitialTheme';

import dispatchInitialCollapsedComments from
  'server/initialState/dispatchInitialCollapsedComments';

const binFiles = KoaStatic('bin');
const assetFiles = KoaStatic('assets');

const processes = process.env.PROCESSES || cpus().length;

// set up the private API
const ConfigedAPIOptions = {
  ...APIOptions,
  origin: 'https://www.reddit.com',
  oauthAppOrigin: 'https://m.reddit.com',
  clientId: process.env.SECRET_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_SECRET,
};

export function startServer() {
  console.log(`Started server at PID ${process.pid}`);
  // Create and launch the server
  return Server({
    routes,
    template: main,
    reducers: allReducers,
    dispatchBeforeNavigation: async (ctx, dispatch/*, getState, utils*/) => {
      await dispatchSession(ctx, dispatch, ConfigedAPIOptions);
      await dispatchInitialTheme(ctx, dispatch);
      await dispatchInitialCollapsedComments(ctx, dispatch);
      await dispatchInitialCompact(ctx, dispatch);
    },
    preRouteServerMiddleware: [
      binFiles,
      assetFiles,
    ],
    getServerRouter: router => {
      // private routes for login, logout, register, and token refresh
      loginproxy(router, ConfigedAPIOptions);
      logoutproxy(router, ConfigedAPIOptions);
      // registerproxy(router, ConfigedAPIOptions);
      refreshproxy(router, ConfigedAPIOptions);
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
