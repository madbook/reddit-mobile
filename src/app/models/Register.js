import superagent from 'superagent';

import ResponseError from 'apiClient/errors/ResponseError';
import ValidationError from 'apiClient/errors/ValidationError';


export const registerUser = (username, password, email, newsletter, gRecaptchaResponse) =>
  new Promise((resolve, reject) => {
    superagent
      .post('/registerproxy')
      .send({ username, password, email, newsletter, gRecaptchaResponse })
      .end((err, res) => {
        if (err && err.response) {
          reject(new ValidationError('/registerproxy', [err.response.body], err.status));
        } else if (err || !res.body) {
          reject(new ResponseError(err, '/registerproxy'));
        } else {
          resolve(res.body.session);
        }
      });
  });
