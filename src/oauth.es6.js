import crypto from 'crypto';
import scmp from 'scmp';
import superagent from 'superagent';
import uuid from 'uuid';

// set up oauth routes
var oauthRoutes = function(app) {
  var router = app.router;

  var cookieOptions = {
    signed: true,
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: true,
    maxAge: 1000 * 3000,
  };

  if (app.getConfig('cookieDomain')) {
    cookieOptions.domain = app.getConfig('cookieDomain');
  }

  var OAuth2 = require('simple-oauth2')({
    clientID: app.config.oauth.clientId,
    clientSecret: app.config.oauth.secret,
    site: app.config.nonAuthAPIOrigin,
    authorizationPath: '/api/v1/authorize.compact',
    tokenPath: '/api/v1/access_token',
  });

  var redirect = app.config.origin + '/oauth2/token';

  function getToken (code, redirect) {
    var ctx = this;

    return new Promise(function(resolve) {
      OAuth2.authCode.getToken({
        code: code,
        redirect_uri: redirect,
      }, function(err, result) {
        if (err) {
          return ctx.redirect('/');
        }

        resolve(result);
      });
    });
  }

  function hmac (data) {
    var key = app.getConfig('keys')[0];
    var secret = new Buffer(key, 'base64').toString();
    var algorithm = 'sha1';
    var hash;
    var hmac;

    hmac = crypto.createHmac(algorithm, secret);
    hmac.setEncoding('hex');
    hmac.write(data);
    hmac.end();

    return hmac.read();
  }

  router.get('/oauth2/login', function * () {
    var origin = app.getConfig('origin') + '/';

    // referer spelled wrong according to spec.
    var referer = this.get('Referer') || '/';
    var state = hmac(referer);
    var redirectURI = referer;

    if ((!this.get('Referer')) || (this.get('Referer') && this.get('Referer').slice(0, origin.length) === origin)) {
      redirectURI = OAuth2.authCode.authorizeURL({
        redirect_uri: redirect,
        scope: 'history,identity,mysubreddits,read,subscribe,vote,submit,save',
        state: `${state}|${referer}`,
      });

      this.redirect(redirectURI);
    } else {
      this.redirect('/403');
    }
  });

  router.get('/logout', function * () {
    this.cookies.set('token');
    this.cookies.set('user');
    this.redirect('/');
  });

  router.get('/oauth2/error', function *() {
    this.redirect('/');
  });

  router.get('/oauth2/token', function * () {
    var token;
    var code = this.query.code;
    var error = this.query.error;

    if (error) {
      return this.redirect('/oauth2/error?message=' + this.query.error);
    }

    var [state, referer] = this.query.state.split('|');

    if (!scmp(state, hmac(referer))) {
      return this.redirect('/403');
    }

    var result = yield getToken(code, redirect);

    token = OAuth2.accessToken.create(result);

    this.cookies.set('token', token.token.access_token, cookieOptions);

    var options = {
      user: 'me', //the current oauth api doesn't return userid. :(
      headers: {
        Authorization: 'bearer ' + token.token.access_token,
      },
    }

    var user = yield app.V1Api(token.token.access_token).users.get(options);

    this.cookies.set('user', JSON.stringify(user.data), cookieOptions);

    this.redirect(referer || '/');
  });


  /*
   * Only works with specific clients with specific trusted client IDs
   * (`mobile_auth_allowed_clients` in reddit config.) If you aren't that,
   * set the LOGIN_PATH env variable to nothing or '/oauth2/login' (default).
   */
  router.post('/login', function * () {
    var ctx = this;
    var id = uuid.v4();
    var endpoint = app.config.nonAuthAPIOrigin + '/api/fp/1/auth/access_token';

    var b = new Buffer(
      app.config.oauth.secretClientId + ':' + app.config.oauth.secretSecret
    );

    var s = b.toString('base64');

    var basicAuth = 'Basic ' + s;

    var data = {
      grant_type: 'password',
      username: ctx.body.username,
      password: ctx.body.password,
      device_id: id,
      duration: 'permanent',
    };

    var p = new Promise(function(resolve, reject) {
      superagent
        .post(endpoint)
        .set({
          'User-Agent': app.config.userAgent,
          'Authorization': basicAuth,
        })
        .type('form')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            return resolve(ctx.redirect('/login?error=' + (res.status || 500)));
          }

          /* temporary while api returns a `200` with an error in body */
          if (res.body.error) {
            return resolve(ctx.redirect('/login?error=401'));
          }

          var token = OAuth2.accessToken.create(res.body);

          ctx.cookies.set('token', token.token.access_token, cookieOptions);

          var options = {
            user: 'me', //the current oauth api doesn't return userid. :(
            headers: {
              Authorization: 'bearer ' + token.token.access_token,
            },
          };

          app.V1Api(token.token.access_token).users.get(options).then(function(user) {
            ctx.cookies.set('user', JSON.stringify(user.data), cookieOptions);
            return resolve(ctx.redirect('/'));
          }, function(e) {
            return resolve(ctx.redirect('/login?error=500'));
          });
        });
    });

    yield p;
  });
}

export default oauthRoutes;
