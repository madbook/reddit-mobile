// set up oauth routes
var oauthRoutes = function(app) {
  var router = app.router;

  var cookieOptions = {
    signed: true,
    secure: app.getConfig('https'),
    httpOnly: true,
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

  router.get('/login', function * () {
    var redirectURI = OAuth2.authCode.authorizeURL({
      redirect_uri: redirect,
      scope: 'history,identity,mysubreddits,read,subscribe,vote,submit,save',
      state: 'lambeosaurus',
    });

    this.cookies.set('redirect', this.get('Referer') || '/', cookieOptions);

    this.redirect(redirectURI);
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

    this.redirect(this.cookies.get('redirect') || '/');
  });
}

export default oauthRoutes;
