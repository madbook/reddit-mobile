import writeSessionToResponse from './writeSessionToResponse';
import { PrivateAPI } from '@r/private';

export default (router, apiOptions) => {
  router.post('/loginproxy', async (ctx/*, next*/) => {
    const { username, password } = ctx.request.body;

    try {
      // try to grab a session from the api
      const data = await PrivateAPI.login(apiOptions, username, password);

      // writeSessionToResponse will set the cookies
      writeSessionToResponse(ctx, data);
    } catch (e) {
      console.log(e);
      let errormsg = 'UNKNOWN_ERROR';

      // A little unfortunate looking, but this is how the response looks
      if (Array.isArray(e) && Array.isArray(e[0]) && !!e[0][0]) {
        errormsg = e[0][0];
      }
      // TODO: figure out how to get this to return json content type
      ctx.throw(401, JSON.stringify({error: errormsg}));
    }
  });
};
