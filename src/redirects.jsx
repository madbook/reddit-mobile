// Redirect desktop urls to mobile-web urls.
const SORTS = ['hot', 'new', 'rising', 'controversial', 'top', 'gilded'];

function routes(app) {
  app.router
    .param('sort', function *(sort, next) {
      if (SORTS.indexOf(sort) !== -1) {
        var url = `?sort=${sort}`;

        if (this.params.subreddit) {
          url = `/r/${this.params.subreddit}${url}`;
        }

        return this.redirect(url);
      }

      yield next;
    })
    .get('/:sort')
    .get('/r/:subreddit/:sort');

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
