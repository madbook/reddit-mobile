export default (router) => {
  router.post('/logout', async (ctx/*, next*/) => {
    ctx.cookies.set('token');
    ctx.cookies.set('tokenExpires');
    ctx.cookies.set('refreshToken');
    ctx.cookies.set('over18');
    ctx.cookies.set('reddit_session');
    ctx.cookies.set('compact');
    ctx.cookies.set('theme');
    ctx.redirect('/');
  });
};
