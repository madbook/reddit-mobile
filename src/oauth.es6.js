var crypto = require('crypto');
var scmp = require('scmp');

// set up oauth routes
var oauthRoutes = function(app) {
  var router = app.router;

  var cookieOptions = {
    signed: true,
    secure: app.getConfig('https'),
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
          return ctx.redirect('/oauth2/error?message=' + encodeURIComponent(err.message));
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

  router.get('/login', function * () {
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
    this.body = this.query;
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

    this.cookies.set('user', JSON.stringify(user), cookieOptions);

    this.redirect(referer || '/');
  });
}

export default oauthRoutes;
