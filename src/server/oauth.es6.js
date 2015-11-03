import crypto from 'crypto';
import scmp from 'scmp';
import superagent from 'superagent';
import uuid from 'uuid';
import url from 'url';
import querystring from 'querystring';

const SCOPES = 'history,identity,mysubreddits,read,subscribe,vote,submit,save,edit,account,creddits,flair,livemanage,modconfig,modcontributors,modflair,modlog,modothers,modposts,modself,modwiki,privatemessages,report,subscribe,wikiedit,wikiread';

function nukeTokens(ctx) {
  ctx.cookies.set('token');
  ctx.cookies.set('tokenExpires');
  ctx.cookies.set('refreshToken');
}

// set up oauth routes
var oauthRoutes = function(app) {
  app.nukeTokens = nukeTokens;

  const router = app.router;

  let cookieOptions = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  };

  function getPassthroughHeaders(ctx, app) {
    if (app.getConfig('apiPassThroughHeaders')) {
      return app.getConfig('apiPassThroughHeaders').reduce(function(headers, key){
        if (ctx.headers[key]) {
          headers[key] = ctx.headers[key];
        }
        return headers;
      }, {});
    }

    return {};
  }

  function assignPassThroughHeaders(obj, ctx, app) {
    return Object.assign(obj, getPassthroughHeaders(ctx, app));
  }

  if (app.getConfig('cookieDomain')) {
    cookieOptions.domain = app.getConfig('cookieDomain');
  }

  const longCookieOptions = Object.assign({}, cookieOptions, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  function setTokenCookie(ctx, token) {
    ctx.cookies.set('token', token.token.access_token, longCookieOptions);
    ctx.cookies.set('tokenExpires', token.token.expires_at.toString(), longCookieOptions);

    if (token.token.refresh_token) {
      ctx.cookies.set('refreshToken', token.token.refresh_token, longCookieOptions);
    }
  }

  app.setTokenCookie = setTokenCookie;

  function hmac (key, data) {
    const secret = new Buffer(key, 'base64').toString();
    const algorithm = 'sha1';

    let hmac = crypto.createHmac(algorithm, secret);
    hmac.setEncoding('hex');
    hmac.write(data);
    hmac.end();

    return hmac.read();
  }

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

  function refreshToken (ctx, rToken) {
    return new Promise(function(resolve, reject) {
      const endpoint = app.config.nonAuthAPIOrigin + '/api/v1/access_token';
      let b;

      if (app.config.oauth.secretClientId) {
        b = new Buffer(
          app.config.oauth.secretClientId + ':' + app.config.oauth.secretSecret
        );
      } else {
        b = new Buffer(
          app.config.oauth.clientId + ':' + app.config.oauth.secret
        );
      }

      let s = b.toString('base64');

      const basicAuth = 'Basic ' + s;

      let data = {
        grant_type: 'refresh_token',
        refresh_token: rToken,
      };

      const headers = {
        'User-Agent': ctx.headers['user-agent'],
        'Authorization': basicAuth,
      };

      assignPassThroughHeaders(headers, ctx, app);

      Object.assign(headers, app.config.apiHeaders || {});

      superagent
        .post(endpoint)
        .set(headers)
        .type('form')
        .send(data)
        .end((err, res) => {
          if (err || !res.ok) {
            return reject(err || res);
          }

          /* temporary while api returns a `200` with an error in body */
          if (res.body.error) {
            return reject(401);
          }

          var token = OAuth2.accessToken.create(res.body);
          return resolve(token);
        });
    });
  }

  app.refreshToken = refreshToken;

  function convertSession(ctx, session) {
    return new Promise(function(resolve, reject) {
      const endpoint = app.config.nonAuthAPIOrigin + '/api/me.json';

      let cookie = ctx.headers['cookie'].replace(/__cf_mob_redir=1/, '__cf_mob_redir=0');

      let headers = {
        'User-Agent': ctx.headers['user-agent'],
        cookie: cookie,
        'accept-encoding': ctx.headers['accept-encoding'],
        'accept-language': ctx.headers['accept-language'],
      };

      assignPassThroughHeaders(headers, ctx, app);

      Object.assign(headers, app.config.apiHeaders || {});

      superagent
        .get(endpoint)
        .set(headers)
        .end((err, res) => {
          if (err || !res.ok) {
            return reject(err || res);
          }

          if (res.body.error || !res.body.data) {
            app.error('Invalid modhash', this, app, { redirect: false, replaceBody: false });
            return reject(401);
          }

          let modhash = res.body.data.modhash;
          let endpoint = app.config.nonAuthAPIOrigin + '/api/v1/authorize';

          let redirect_uri = app.config.origin + '/oauth2/token';

          let clientId;
          let clientSecret;

          if (app.config.oauth.secretClientId) {
            clientId = app.config.oauth.secretClientId;
            clientSecret = app.config.oauth.secretSecret;
          } else {
            clientId = app.config.oauth.clientId;
            clientSecret = app.config.oauth.secret;
          }


          let postParams = {
            client_id: clientId,
            redirect_uri: redirect_uri,
            scope: SCOPES,
            state: modhash,
            duration: 'permanent',
            authorize: 'yes',
          };

          headers['x-modhash'] = modhash;

          superagent
            .post(endpoint)
            .set(headers)
            .type('form')
            .send(postParams)
            .redirects(0)
            .end((err, res) => {
              if (res.status !== 302) {
                return resolve(res.status || 500);
              }

              if (res.body.error) {
                return resolve(401);
              }

              let location = url.parse(res.headers.location, true);
              let code = location.query.code;

              let endpoint = app.config.nonAuthAPIOrigin + '/api/v1/access_token';

              let postData = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
              };

              let b = new Buffer(
                clientId + ':' + clientSecret
              );

              let s = b.toString('base64');
              let basicAuth = 'Basic ' + s;

              let headers = {
                'User-Agent': ctx.headers['user-agent'],
                'Authorization': basicAuth,
              };

              assignPassThroughHeaders(headers, ctx, app);

              Object.assign(headers, app.config.apiHeaders || {});

              superagent
                .post(endpoint)
                .set(headers)
                .send(postData)
                .type('form')
                .end(function(err, res) {
                  if (!res.ok) {
                    reject(err);
                  }

                  let token = OAuth2.accessToken.create(res.body)
                  return resolve(token);
                });
            });
        });
    });
  }

  app.convertSession = convertSession;

  const OAuth2 = require('simple-oauth2')({
    clientID: app.config.oauth.clientId,
    clientSecret: app.config.oauth.secret,
    site: app.config.nonAuthAPIOrigin,
    authorizationPath: '/api/v1/authorize.compact',
    tokenPath: '/api/v1/access_token',
  });

  const redirect = app.config.origin + '/oauth2/token';

  router.get('/oauth2/login', function * () {
    const origin = app.getConfig('origin') + '/';

    // referer spelled wrong according to spec.
    let referer = this.get('Referer') || '/';
    const key = app.getConfig('keys')[0];
    let state = hmac(key, referer);
    let redirectURI = referer;

    if ((!this.get('Referer')) || (this.get('Referer') && this.get('Referer').slice(0, origin.length) === origin)) {
      redirectURI = OAuth2.authCode.authorizeURL({
        redirect_uri: redirect,
        scope: SCOPES,
        state: `${state}|${referer}`,
        duration: 'permanent',
      });

      this.redirect(redirectURI);
    } else {
      this.redirect('/403');
    }
  });

  router.get('/logout', function * () {
    nukeTokens(this);
    this.cookies.set('reddit_session', undefined, {
      domain: '.reddit.com',
    });
    return this.redirect('/');
  });

  router.get('/oauth2/error', function *() {
    this.redirect('/');
  });

  router.get('/oauth2/refresh', function * () {
    let token = this.cookies.get('token');
    let rToken = this.cookies.get('refreshToken');

    if (!this.cookies.get('token')) {
      this.body = undefined;
      return;
    }

    try {
      let result = yield refreshToken(this, rToken);
      setTokenCookie(this, result);

      this.body = {
        token: result.token.access_token,
        tokenExpires: result.token.expires_at.toString(),
      };
    } catch (e) {
      nukeTokens(this);
    }
  });

  router.get('/oauth2/token', function * () {
    let code = this.query.code;
    let error = this.query.error;
    let ctx = this;

    if (error) {
      return this.redirect('/oauth2/error?message=' + this.query.error);
    }

    let [state, referer] = this.query.state.split('|');
    const key = app.getConfig('keys')[0];

    if (!scmp(state, hmac(key, referer))) {
      return this.redirect('/403');
    }

    let result = yield getToken(this, code, redirect);

    let token = OAuth2.accessToken.create(result);

    setTokenCookie(this, token);

    this.redirect(referer || '/');
  });

  function login(username, password, ctx) {
    let id = uuid.v4();
    const endpoint = app.config.nonAuthAPIOrigin + '/api/fp/1/auth/access_token';

    let b = new Buffer(
      app.config.oauth.secretClientId + ':' + app.config.oauth.secretSecret
    );

    let s = b.toString('base64');

    let basicAuth = 'Basic ' + s;

    let data = {
      grant_type: 'password',
      username: username,
      password: password,
      device_id: id,
      duration: 'permanent',
    };

    let p = new Promise(function(resolve, reject) {
      let headers = {
        'User-Agent': ctx.headers['user-agent'],
        'Authorization': basicAuth,
      };

      assignPassThroughHeaders(headers, ctx, app);

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

          let token = OAuth2.accessToken.create(res.body);

          setTokenCookie(ctx, token);
          resolve(200);
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
    let status = yield login(this.body.username, this.body.password, this);
    const dest = this.body.originalUrl || '';

    if (status === 200) {
      if (dest) {
        this.redirect(app.config.origin + dest);
    } else {
        this.redirect('/');
      }
    } else {
      this.redirect('/login?error=' + status);
    }
  });

  router.post('/register', function * () {
    let ctx = this;
    const endpoint = app.config.nonAuthAPIOrigin + '/api/register';
    const dest = this.body.originalUrl || '';

    let data = {
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

    let p = new Promise(function(resolve, reject) {

      let headers = Object.assign({
        'User-Agent': ctx.headers['user-agent'],
      }, app.config.apiHeaders || {});

      assignPassThroughHeaders(headers, ctx, app);

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
              if (dest) {
                return resolve(ctx.redirect(app.config.origin + dest));
              } else {
                return resolve(ctx.redirect('/'));
              }
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
