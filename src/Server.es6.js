import 'babel-polyfill';
import Server from '@r/platform/server';
import APIOptions from '@r/api-client';
import KoaStatic from 'koa-static';

import routes from './app/router/routes';
import main from './server/templates/main';
import allReducers from './app/reducers/importAll';
import loginproxy from './server/session/loginproxy';
import logoutproxy from './server/session/logoutproxy';
import refreshproxy from './server/session/refreshproxy';
import dispatchSession from './server/session/dispatchSession';

const binFiles = KoaStatic('bin');
const assetFiles = KoaStatic('assets');

// set up the private API
const ConfigedAPIOptions = {
  ...APIOptions,
  origin: 'https://www.reddit.com',
  oauthAppOrigin: 'https://m.reddit.com',
  clientId: process.env.SECRET_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_SECRET,
};

console.log(ConfigedAPIOptions);

// Create and launch the server
Server({
  routes,
  template: main,
  reducers: allReducers,
  dispatchBeforeNavigation: async (ctx, dispatch, getState, utils) => {
    await dispatchSession(ctx, dispatch, ConfigedAPIOptions);
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
  }
})();
