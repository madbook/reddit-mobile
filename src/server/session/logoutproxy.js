import config from 'config';
import clearSessionCookies from './clearSessionCookies';

export default (router) => {
  router.post('/logout', async (ctx/*, next*/) => {
    // NOTE: this is only temporary for now. Desktop uses a separate cookie
    // called `reddit_session`. On any request to mweb, the server checks for it
    // and attempts to convert it to an oauth session. To really log out
    // we have to clear this cookie. The `token` cookie stores mweb oauth
    // (and amp, modmail, etc) is now available on the root reddit domain, so
    // we can unify these sessions and only have one cookie to clear.
    ctx.cookies.set('reddit_session', undefined, { domain: config.rootReddit });
    ctx.cookies.set('token', undefined, { domain: config.rootReddit });
    ctx.cookies.set('reddit_session');

    clearSessionCookies(ctx);
    ctx.cookies.set('over18');
    ctx.cookies.set('compact');
    ctx.cookies.set('theme');
    ctx.redirect('/');
  });
};
