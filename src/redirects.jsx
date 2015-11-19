// Redirect desktop urls to mobile-web urls.
const SORTS = ['hot', 'new', 'rising', 'controversial', 'top', 'gilded'];

function redirectSort (ctx, sort, subreddit) {
  var url = `?sort=${sort}`;

  if (subreddit) {
    url = `/r/${subreddit}${url}`;
  } else {
    url = `/${url}`;
  }

  ctx.redirect(url);
}

function routes(app) {
  SORTS.forEach(function(sort) {
    app.router.get(`/${sort}`, function *() {
      redirectSort(this, 'hot', this.params.subreddit);
    });

    app.router.get('/r/:subreddit/' + sort, function *() {
      redirectSort(this, sort, this.params.subreddit);
    });
  });

  app.router.get('/user/:user', function *() {
    return this.redirect(`/u/${this.params.user}`);
  });

  app.router.get('/user/:user/m/:multi', function *() {
    return this.redirect(`/u/${this.params.user}/m/${this.params.multi}`);
  });

  app.router.get('/search/:query', function*() {
    return this.redirect(`/search?q=${this.params.query}`);
  });

  app.router.get('/r/:subreddit/search/:query', function*() {
    return this.redirect(`/r/${this.params.subreddit}/search?q=${this.params.query}`);
  });

  app.router.get('/help/*', function*() {
    const url = this.params[0];
    return this.redirect(`/wiki/${url}`);
  });
}

export default routes;
