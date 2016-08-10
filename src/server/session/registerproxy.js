import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

export default (router, apiOptions) => {
  router.post('/registerproxy', async (ctx/*, next*/) => {
    const { username, password, email, newsletter} = ctx.request.body;

    try {
      const newsletterSubscribe = !!newsletter.length;
      const data = await PrivateAPI.register(apiOptions, username, password, email, newsletterSubscribe);
      // writeSessionToResponse will set the cookies
      writeSessionToResponse(ctx, data);
    } catch (e) {
      console.log(e);
      let errormsg = 'UNKNOWN_ERROR';

      if (e && (typeof e === 'string')) {
        errormsg = e;
      }

      // TODO: figure out how to get this to return json content type
      ctx.throw(401, JSON.stringify({error: errormsg}));
    }
  });
};
