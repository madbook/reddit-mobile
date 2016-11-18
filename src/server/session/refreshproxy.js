import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

import proxiedApiOptions from 'lib/proxiedApiOptions';

export default (router, apiOptions) => {
  router.post('/refreshproxy', async (ctx) => {
    const { refreshToken } = ctx.request.body;

    try {
      // refresh the token
      const data = await PrivateAPI.refreshToken(
        proxiedApiOptions(ctx, apiOptions), refreshToken, ctx.orderedHeaders, ctx.headers['user-agent']
      );

      // writeSessionToResponse will also set the cookies
      writeSessionToResponse(ctx, { ...data, refresh_token: refreshToken });
    } catch (e) {
      console.log(e);
      console.log(e.stack);
      ctx.throw(400, 'Error');
    }
  });
};
