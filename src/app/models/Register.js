
import superagent from 'superagent';

export const registerUser = (username, password, email, newsletter) =>
  new Promise((resolve, reject) => {
    superagent
      .post('/registerproxy')
      .send({ username, password, email, newsletter })
      .end((err, res) => {
        if (err || !res.body) { return reject(res.text); }
        resolve(res.body.session);
      });
  });
