import superagent from 'superagent';
import crypto from 'crypto';

import constants from '../constants';

// Static file needed to support deep links on iOS
const appleAppSiteAssociation = JSON.stringify({
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
        paths: [ '/', '/r/*', '/u/*', '/user/*' ],
      },
    ],
  },
});

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

    if (!app.config.actionNameSecret) {
      console.log('returning early, no secret');
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
