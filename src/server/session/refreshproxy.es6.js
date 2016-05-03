import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

export default (router, apiOptions) => {
  router.post('/refreshproxy', async (ctx, next) => {
    const { refreshToken } = ctx.request.body;

    try {
      // refresh the token
      const data = await PrivateAPI.refreshToken(apiOptions, refreshToken);

      // writeSessionToResponse will also set the cookies
      writeSessionToResponse(ctx, { ...data, refresh_token: refreshToken });
    } catch (e) {
      console.log(e);
      console.log(e.stack);
      ctx.throw(400, 'Error');
    }
  });
}
