import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

import { logServerError } from 'lib/errorLog';
import proxiedApiOptions from 'lib/proxiedApiOptions';

import { loginErrors, genericErrors } from 'app/constants';


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
      ctx.status = 401;
      if (error === loginErrors.WRONG_PASSWORD ||
          error === loginErrors.BAD_USERNAME ||
          error === loginErrors.INCORRECT_USERNAME_PASSWORD) {
        ctx.body = { error };
      } else {
        // If we don't know the error type, we still want to convey to the
        // client that an error occurred.
        ctx.body = { error: genericErrors.UNKNOWN_ERROR };
        logServerError(error, ctx);
      }
    }
  });
};
