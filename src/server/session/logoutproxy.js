import clearSessionCookies from './clearSessionCookies';

export default (router) => {
  router.post('/logout', async (ctx/*, next*/) => {
    clearSessionCookies(ctx);
    ctx.cookies.set('over18');
    ctx.cookies.set('reddit_session');
    ctx.cookies.set('compact');
    ctx.cookies.set('theme');
    ctx.redirect('/');
  });
};
