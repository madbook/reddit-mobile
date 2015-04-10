// Redirect desktop urls to mobile-web urls.
function routes(app) {
  app.router.get(/^\/(hot|new|rising|controversial|top|gilded)\b/, function *(next) {
    this.redirect('/?sort=' + this.params[0]);
  });

  app.router.get(/^\/r\/(\w+)\/(hot|new|rising|controversial|top|gilded)\b/, function *(next) {
    this.redirect('/r/' + this.params[0] + '/?sort=' + this.params[1]);
  });

  app.router.get('/user/:user', function *(next) {
    this.redirect('/u/' + this.params.user);
  });

  app.router.get('/user/:user/m/:multi', function *(next) {
    this.redirect('/u/' + this.params.user + '/m/' + this.params.multi);
  });

  app.router.get('/search/:query', function*(next) {
    this.redirect(`/search?q=${this.params.query}`);
  });

  app.router.get('/r/:subreddit/search/:query', function*(next) {
    this.redirect(`/r/${this.params.subreddit}/search?q=${this.params.query}`);
  });
}

export default routes;
