import crypto from 'crypto';
import scmp from 'scmp';
import superagent from 'superagent';
import uuid from 'uuid';

// set up oauth routes
var oauthRoutes = function(app) {
  var router = app.router;

  var cookieOptions = {
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

  function getToken (ctx, code, redirect) {
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
    var ctx = this;

    if (error) {
      return this.redirect('/oauth2/error?message=' + this.query.error);
    }

    var [state, referer] = this.query.state.split('|');

    if (!scmp(state, hmac(referer))) {
      return this.redirect('/403');
    }

    var result = yield getToken(this, code, redirect);

    token = OAuth2.accessToken.create(result);

    this.cookies.set('token', token.token.access_token, cookieOptions);

    var apiOptions =  {
      origin: app.getConfig('authAPIOrigin'),
      headers: {
        'Authorization': `bearer ${token.token.access_token}`,
        'user-agent': ctx.headers['user-agent'],
      }
    };

    var options = app.api.buildOptions(apiOptions);
    options.user = 'me';

    var user = yield app.api.users.get(options);

    this.cookies.set('user', JSON.stringify(user.data), cookieOptions);

    this.redirect(referer || '/');
  });

  function login(username, password, ctx) {
    var id = uuid.v4();
    var endpoint = app.config.nonAuthAPIOrigin + '/api/fp/1/auth/access_token';

    var b = new Buffer(
      app.config.oauth.secretClientId + ':' + app.config.oauth.secretSecret
    );

    var s = b.toString('base64');

    var basicAuth = 'Basic ' + s;

    var data = {
      grant_type: 'password',
      username: username,
      password: password,
      device_id: id,
      duration: 'permanent',
    };

    var p = new Promise(function(resolve, reject) {
      var headers = {
        'User-Agent': ctx.headers['user-agent'],
        'Authorization': basicAuth,
      };

      Object.assign(headers, app.config.apiHeaders || {});

      superagent
        .post(endpoint)
        .set(headers)
        .type('form')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            return resolve(res.status || 500);
          }

          /* temporary while api returns a `200` with an error in body */
          if (res.body.error) {
            return resolve(401);
          }

          var token = OAuth2.accessToken.create(res.body);

          ctx.cookies.set('token', token.token.access_token, cookieOptions);

          var apiOptions = {
            origin: app.getConfig('authAPIOrigin'),
            headers: {
              'Authorization': `bearer ${token.token.access_token}`,
              'user-agent': ctx.headers['user-agent'],
            }
          };

          var options = app.api.buildOptions(apiOptions);
          options.user = 'me';

          Object.assign(options.headers, app.config.apiHeaders || {});

          app.api.users.get(options).then(function(user) {
            ctx.cookies.set('user', JSON.stringify(user.data), cookieOptions);
            return resolve(200);
          }, function(e) {
            return resolve(500);
          });
        });
    });

    return p;
  }

  /*
   * Only works with specific clients with specific trusted client IDs
   * (`mobile_auth_allowed_clients` in reddit config.) If you aren't that,
   * set the LOGIN_PATH env variable to nothing or '/oauth2/login' (default).
   */
  router.post('/login', function * () {
    var status = yield login(this.body.username, this.body.password, this);

    if (status === 200) {
      this.redirect('/');
    } else {
      this.redirect('/login?error=' + status);
    }
  });

  router.post('/register', function * () {
    var ctx = this;
    var endpoint = app.config.nonAuthAPIOrigin + '/api/register';

    var data = {
      user: ctx.body.username,
      passwd: ctx.body.password,
      passwd2: ctx.body.password2,
      api_type: 'json',
    };

    if (ctx.body.email) {
      data.email = ctx.body.email;
    }

    if (ctx.body.newsletter === 'on') {
      data.newsletter_subscribe = true;
    }

    if (ctx.body.password !== ctx.body.password2) {
      return ctx.redirect('/register?error=PASSWORD_MATCH&message=passwords+do+not+match');
    }

    if (!ctx.body.email && ctx.body.newsletter === 'on') {
      return ctx.redirect('/register?error=EMAIL_NEWSLETTER&message=please+enter+an+email+to+sign+up+for+the+newsletter');
    }

    var p = new Promise(function(resolve, reject) {
      var headers = Object.assign({
        'User-Agent': ctx.headers['user-agent'],
      }, app.config.apiHeaders || {});

      superagent
        .post(endpoint)
        .set(headers)
        .type('form')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            return resolve(ctx.redirect('/register?error=' + (res.status || 500)));
          }

          /* temporary while api returns a `200` with an error in body */
          if (res.body.json.errors && res.body.json.errors[0]) {
            var error = res.body.json.errors[0];
            return resolve(ctx.redirect(`/register?error=${error[0]}&message=${error[1]}`));
          }


          login(data.user, data.passwd, ctx).then(function(status) {
            if (status === 200) {
              return resolve(ctx.redirect('/'));
            } else {
              return resolve(ctx.redirect('/login?error=' + status));
            }
          });
      });
    });

    yield p;
  });
}

export default oauthRoutes;
