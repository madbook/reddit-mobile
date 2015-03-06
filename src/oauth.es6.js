// set up oauth routes
var oauthRoutes = function(app) {
  var router = app.router;

  var OAuth2 = require('simple-oauth2')({
    clientID: app.config.oauth.clientId,
    clientSecret: app.config.oauth.secret,
    site: app.config.nonAuthAPIOrigin,
    authorizationPath: '/api/v1/authorize.compact',
    tokenPath: '/api/v1/access_token',
  });

  var redirect = app.config.origin + '/oauth2/token';

  function getToken (code, redirect) {
    return new Promise(function(reject, resolve) {
      OAuth2.authCode.getToken({
        code: code,
        redirect_uri: redirect,
      }, function(err, result) {
        resolve({ err: err, result: result });
      });
    });
  }

  router.get('/login', function * () {
    var redirectURI = OAuth2.authCode.authorizeURL({
      redirect_uri: redirect,
      scope: 'history,identity,mysubreddits,read,subscribe,vote,submit,save',
      state: req.csrfToken(),
    });

    this.session.redirect = req.get('Referer') || '/';
    this.redirect(redirectURI);
  });

  router.get('/oauth2/error', function *() {
    this.body = req.query;
  });

  router.get('/oauth2/token', function * () {
    var token;
    var code = this.query.code;
    var error = this.query.error;

    if (error) {
      return this.redirect('/oauth2/error?message=' + this.query.error);
    }

    var { err, result } = yield getToken(code, redirect);

    if (err) {
      return this.redirect('/oauth2/error?message=' + encodeURIComponent(err.message));
    } else {
      token = OAuth2.accessToken.create(result);
      req.session.token = token.token;

      var options = {
        user: 'me', //the current oauth api doesn't return userid. :(
        headers: {
          Authorization: 'bearer ' + token.token.access_token,
        },
      }

      var user = yield app.V1Api(req).users.get(options);

      this.session.user = user;
      this.redirect(req.session.redirect || '/');
    }
  });
}

export default oauthRoutes;
