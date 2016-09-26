import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

import config from 'config';
import errorLog from 'lib/errorLog';


export default (router, apiOptions) => {
  router.post('/loginproxy', async (ctx/*, next*/) => {
    const { username, password } = ctx.request.body;

    try {
      // try to grab a session from the api
      const data = await PrivateAPI.login(apiOptions, username, password);

      // writeSessionToResponse will set the cookies
      writeSessionToResponse(ctx, data);
    } catch (error) {
      // TODO: the errors we get back aren't helpful, in most cases we
      // only get back 'WRONG_PASSWORD' even if the user field is blank
      ctx.status = 401;
      if (error === 'WRONG_PASSWORD') {
        ctx.body = { error };
      } else { // we're not sure what this error is, log it for now
        errorLog({
          error,
          requestUrl: ctx.request.url,
          userAgent: ctx.headers['user-agent'],
        }, {
          hivemind: config.statsURL,
        });
      }
    }
  });
};
