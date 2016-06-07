import superagent from 'superagent';
import { btoa } from 'Base64';

const fetchLogin = (username, password) => new Promise((resolve, reject) => {
  superagent
    .post('/loginproxy')
    .send({ username, password })
    .end((err, res) => {
      if (err || !res.body) { return reject(err); }
      resolve(res.body);
    });
});

const refreshSession = refreshToken => new Promise((resolve, reject) => {
  superagent
    .post('/refreshproxy')
    .send({ refreshToken })
    .end((err, res) => {
      if (err || !res.body) { return reject(err); }
      resolve(res.body);
    });
});

export default class Session {
  static async fromLogin(username, password) {
    const data = await fetchLogin(username, password);
    return new Session(data.session);
  }

  constructor({ accessToken, tokenType, expires, refreshToken, scope }) {
    this.refreshToken = refreshToken;
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expires = expires;
    this.scope = scope;

    if (Object.freeze) {
      Object.freeze(this);
    }
  }

  get tokenString() {
    return btoa(JSON.stringify(this.toJSON()));
  }

  get isValid() {
    return (new Date()).getTime() < this.expires;
  }

  async refresh() {
    const data = await refreshSession(this.refreshToken);
    return new Session(data.session);
  }

  toJSON() {
    return {
      accessToken: this.accessToken,
      tokenType: this.tokenType,
      expires: this.expires,
      refreshToken: this.refreshToken,
      scope: this.scope,
    };
  }
}
