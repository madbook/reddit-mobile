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
    app.router.get(`/${sort}`, function *(next) {
      redirectSort(this, 'hot', this.params.subreddit);
    });

    app.router.get('/r/:subreddit/' + sort, function *(next) {
      redirectSort(this, sort, this.params.subreddit);
    });
  });

  app.router.get('/user/:user', function *(next) {
    return this.redirect(`/u/${this.params.user}`);
  });

  app.router.get('/user/:user/m/:multi', function *(next) {
    return this.redirect(`/u/${this.params.user}/m/${this.params.multi}`);
  });

  app.router.get('/search/:query', function*(next) {
    return this.redirect(`/search?q=${this.params.query}`);
  });

  app.router.get('/r/:subreddit/search/:query', function*(next) {
    return this.redirect(`/r/${this.params.subreddit}/search?q=${this.params.query}`);
  });
}

export default routes;
