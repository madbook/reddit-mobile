import crypto from 'crypto';

import superagent from 'superagent';

import { formatLogJSON } from 'lib/errorLog';
import { DEFAULT_API_TIMEOUT } from 'app/constants';
import routes from 'app/router';

// Generate the client actionNames from the routes
const mClientName = name => `m2.client.${name}`;
const routeNames = routes.filter(r => r[2] && r[2].name).map(r => r[2].name);
const CLIENT_NAMES = new Set(routeNames.map(mClientName));

// Generate the server actionNames
const mServerName = name => `m2.server.${name}`;
const SERVER_NAMES = new Set(['shell', 'seo'].map(mServerName));

const ALLOWED_ACTION_NAMES = new Set([...CLIENT_NAMES, ...SERVER_NAMES]);

// These are the keys we allow passing over to hivemind
const ALLOWED_TIMINGS_KEYS = new Set([
  'actionName',
  'mountTiming',
  'routeTiming',
  'redirectTiming',
  'startTiming',
  'dnsTiming',
  'tcpTiming',
  'httpsTiming',
  'requestTiming',
  'responseTiming',
  'domLoadingTiming',
  'domInteractiveTiming',
  'domContentLoadedTiming',
]);

const appleAppSiteAssociation = JSON.stringify({
  activitycontinuation: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  webcredentials: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  applinks: {
    apps: [],
    details: [
      {
        appID: '2TDUX39LX8.com.reddit.Reddit',
        paths: [ '/r/*', '/u/*', '/user/*', '/comments/*' ],
      },
    ],
  },
});

const EXCLUDED_ROUTES = ['*', '/robots.txt', '/live/:idOrFilter?',
                         '/goto', '/faq', '/health', '/routes',
                         '/apple-app-site-association'];

export default (router, apiOptions) => {
  router.get('/routes', (ctx) => {
    ctx.body = router.stack
      .filter(function(r) {
        return (
          r.methods.indexOf('GET') > -1 && // only map GET requests
          !r.path.includes('/oauth2/') &&
          !EXCLUDED_ROUTES.includes(r.path)
        );
      })
      .map(function(r) {
        return {
          regexp: r.regexp.toString(),
          path: r.path,
        };
      });
  });

  router.get('/apple-app-site-association', (ctx) => {
    ctx.body = appleAppSiteAssociation;
    ctx.type = 'application/json';
  });

  router.get('/health', (ctx) => {
    ctx.body = 'OK';
  });

  router.get('/robots.txt', (ctx) => {
    ctx.body = `
      # 80legs
      User-agent: 008
      Disallow: /

      # 80legs' new crawler
      User-agent: voltron
      Disallow: /

      User-Agent: bender
      Disallow: /my_shiny_metal_ass

      User-Agent: Gort
      Disallow: /earth

      User-Agent: *
      Disallow: /*/comments/*?*sort=
      Disallow: /r/*/comments/*/*/c*
      Disallow: /comments/*/*/c*
      Disallow: /*after=
      Disallow: /*before=
      Disallow: /login
      Disallow: /search
      Disallow: /r/*/search
      Disallow: /u/*
      Disallow: /message/*
      Disallow: /submit*
      Disallow: /r/*/submit/*
      Allow: /
    `;
  });

  router.post('/error', (ctx) => {
    const { error } = ctx.request.body;
    // log it out if it's a legit origin
    if (ctx.headers.origin &&
        apiOptions.servedOrigin.indexOf(ctx.headers.origin) === 0 &&
        typeof error === 'object') {
      console.log(formatLogJSON(error));
    }

    ctx.body = null;
    return;
  });

  router.post('/csp-report', (ctx) => {
    // log it out if it's a legit origin
    if (ctx.headers.origin &&
        apiOptions.servedOrigin.indexOf(ctx.headers.origin) === 0) {

      const { 'csp-report': report } = ctx.request.body;

      const log = [
        'CSP REPORT',
        report['document-uri'],
        report['blocked-uri'],
      ];

      console.log(log.join('|'));
    }

    ctx.body = null;
    return;
  });

  router.post('/timings', (ctx) => new Promise((resolve, reject) => {
    const statsURL = apiOptions.statsURL;
    const { rum: timings } = ctx.request.body;

    let msg = null;
    if (!apiOptions.actionNameSecret) {
      // Verify we have the secret to send to the server
      msg = 'Set ACTION_NAME_SECRET to enable.';
    } else if (!ALLOWED_ACTION_NAMES.has(timings.actionName)) {
      // Verify the "actionName" is in the allowable namespace
      msg = 'Invalid actionName detected.';
    } else if (Object.keys(timings).some(k => !ALLOWED_TIMINGS_KEYS.has(k))) {
      // Verify that all object keys are expected.
      msg = 'Invalid timings key detected.';
    }

    if (msg !== null) {
      // Put a message in the server log
      const output = {
        error: `Timings not sent -- ${msg}`,
        timings,
      };
      console.warn(JSON.stringify(output));

      // Don't tell the client anything went wrong
      ctx.body = null;
      resolve();
      return;
    }

    const secret = (new Buffer(apiOptions.actionNameSecret, 'base64')).toString();
    const algorithm = 'sha1';

    const hmac = crypto.createHmac(algorithm, secret);
    hmac.setEncoding('hex');
    hmac.write(timings.actionName);
    hmac.end();

    const hash = hmac.read();

    timings.verification = hash;

    superagent
        .post(statsURL)
        .type('json')
        .send({ rum: timings })
        .timeout(DEFAULT_API_TIMEOUT)
        .end(err => err ? reject(err) : resolve());

    ctx.body = null;
  }));
};
