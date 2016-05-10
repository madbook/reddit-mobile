export default (router) => {
  router.post('/logout', async (ctx/*, next*/) => {
    ctx.cookies.set('token');
    ctx.redirect('/');
  });
};
