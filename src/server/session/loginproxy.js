import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

import { logServerError } from 'lib/errorLog';
import proxiedApiOptions from 'lib/proxiedApiOptions';


export default (router, apiOptions) => {
  router.post('/loginproxy', async (ctx) => {
    const { username, password } = ctx.request.body;

    try {
      // try to grab a session from the api
      const data = await PrivateAPI.login(
        proxiedApiOptions(ctx, apiOptions), username, password,
        ctx.orderedHeaders, ctx.headers['user-agent'],
      );

      // writeSessionToResponse will set the cookies
      writeSessionToResponse(ctx, data);
    } catch (error) {
      // TODO: the errors we get back aren't helpful, in most cases we
      // only get back 'WRONG_PASSWORD' even if the user field is blank
      ctx.status = 401;
      if (error === 'WRONG_PASSWORD') {
        ctx.body = { error };
      } else { // we're not sure what this error is, log it for now
        logServerError(error, ctx);
      }
    }
  });
};
