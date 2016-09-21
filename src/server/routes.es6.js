import superagent from 'superagent';
import crypto from 'crypto';

import constants from '../constants';

// Static file needed to support deep links on iOS
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
        paths: [ '/r/*', '/u/*', '/user/*' ],
      },
    ],
  },
});

// prefix in the same way clientLib sendTimings does
const mServerName = name => `m.server.${name}`;

const ALLOWED_ACTION_NAMES = new Set([
  'health',
  'index',
  'index.subreddit',
  'index.multi',
  'random',
  'comments.permalinkActivity',
  'comments.permalink',
  'comments.titlePermalink',
  'comments.title',
  'comments.subreddit',
  'subreddit.about',
  'search.index',
  'search.subreddit',
  'user.profile',
  'user.gild',
  'user.activity',
  'submit',
  'saved',
  'hidden',
  'static.faq',
  'user.login',
  'user.register',
  'messages.compose',
  'messages',
  'wiki',
  'wiki.subreddit',
  '404',
].reduce((names, name) => {
  return names.concat([name, `${name}.no_ads`]);
}, [])
.map(mServerName));

const ALLOWED_TIMINGS_KEYS = new Set([
  'actionName',
  'mountTiming',
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


// set up server-only routes
const serverRoutes = function(app) {
  const router = app.router;

  router.get('/robots.txt', function * () {
    this.body = `
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

  router.get('/apple-app-site-association', function * () {
    this.body = appleAppSiteAssociation;
    this.type = 'application/json';
  });

  router.post('/timings', function *() {
    const statsURL = app.config.statsURL;
    const timings = this.request.body.rum;

    let msg = null;
    if (!app.config.actionNameSecret) {
      // Verify we have the secret to send to the server
      msg = 'Set ACTION_NAME_SECRET to enable timings';
    } else if (!ALLOWED_ACTION_NAMES.has(timings.actionName)) {
      // Verify the "actionName" is in the alloweable namespace
      msg = 'Invalid actionName detected';
    } else if (Object.keys(timings).some(key => !ALLOWED_TIMINGS_KEYS.has(key))) {
      msg = 'Invalid timings key detected';
    }

    if (msg !== null) {
      console.warn(`Timings not sent -- ${msg} Would have sent: ${JSON.stringify(timings)}`);
      return;
    }

    const secret = (new Buffer(app.config.actionNameSecret, 'base64')).toString();
    const algorithm = 'sha1';
    let hash;

    const hmac = crypto.createHmac(algorithm, secret);
    hmac.setEncoding('hex');
    hmac.write(timings.actionName);
    hmac.end();

    hash = hmac.read();

    timings.verification = hash;

    superagent
        .post(statsURL)
        .type('json')
        .send({ rum: timings })
        .timeout(constants.DEFAULT_API_TIMEOUT)
        .end(function() { });
  });

  const EXCLUDED_ROUTES = ['*', '/robots.txt', '/live/:idOrFilter?',
                           '/goto', '/faq', '/health', '/routes',
                           '/apple-app-site-association'];
  router.get('/routes', function *() {
    this.body = app.router.stack.routes
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

  router.post('/error', function* () {
    // log it out if it's a legit origin
    if (this.headers.origin &&
        app.config.origin.indexOf(this.headers.origin) === 0) {
      console.log(this.body.error.substring(0,1000));
    }

    this.body = null;
    return;
  });

  router.post('/csp-report', function* () {
    // log it out if it's a legit origin
    if (this.headers.origin &&
        app.config.origin.indexOf(this.headers.origin) === 0) {

      const report = this.body['csp-report'];

      const log = [
        'CSP REPORT',
        report['document-uri'],
        report['blocked-uri'],
      ];

      console.log(log.join('|'));
    }

    this.body = null;
    return;
  });
};

export default serverRoutes;
