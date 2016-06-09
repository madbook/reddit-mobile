const appleAppSiteAssociation = JSON.stringify({
  activitycontinuation: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  webcredentials: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  applinks: {
    apps: [],
    details: [
      {
        appID: '2TDUX39LX8.com.reddit.Reddit',
        paths: [ '/r/*', '/u/*', '/user/*', '/' ],
      },
    ],
  },
});

const EXCLUDED_ROUTES = ['*', '/robots.txt', '/live/:idOrFilter?',
                         '/goto', '/faq', '/health', '/routes',
                         '/apple-app-site-association'];

export default (router) => {
  router.get('/routes', (ctx) => {
    ctx.body = router.stack
      .filter(function(r) {
        return (
          r.methods.indexOf('GET') > -1 && // only map GET requests
          !r.path.includes('/oauth2/') &&
          !EXCLUDED_ROUTES.includes(r.path)
        );
      })
      .map(function(r) {
        return {
          regexp: r.regexp.toString(),
          path: r.path,
        };
      });
  });

  router.get('/apple-app-site-association', (ctx) => {
    ctx.body = appleAppSiteAssociation;
    ctx.type = 'application/json';
  });

  router.get('/robots.txt', (ctx) => {
    ctx.body = `
      # 80legs
      User-agent: 008
      Disallow: /

      # 80legs' new crawler
      User-agent: voltron
      Disallow: /

      User-Agent: bender
      Disallow: /my_shiny_metal_ass

      User-Agent: Gort
      Disallow: /earth

      User-Agent: *
      Disallow: /*/comments/*?*sort=
      Disallow: /r/*/comments/*/*/c*
      Disallow: /comments/*/*/c*
      Disallow: /*after=
      Disallow: /*before=
      Disallow: /login
      Disallow: /search
      Disallow: /r/*/search
      Disallow: /u/*
      Disallow: /message/*
      Disallow: /submit*
      Disallow: /r/*/submit/*
      Allow: /
    `;
  });
};
