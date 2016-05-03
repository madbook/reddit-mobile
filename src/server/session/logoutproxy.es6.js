export default (router, api) => {
  router.post('/logout', async (ctx, next) => {
    ctx.cookies.set('token');
    ctx.redirect('/');
  });
}
