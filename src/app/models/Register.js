
import superagent from 'superagent';

export const registerUser = (username, password, email, newsletter, gRecaptchaResponse) =>
  new Promise((resolve, reject) => {
    superagent
      .post('/registerproxy')
      .send({ username, password, email, newsletter, gRecaptchaResponse })
      .end((err, res) => {
        if (err || !res.body) { return reject(res.text); }
        resolve(res.body.session);
      });
  });
