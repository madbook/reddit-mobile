// set up server-only routes
var serverRoutes = function(app) {
  var router = app.router;

  router.get('/robots.txt', function * () {
    this.body = `
# 80legs
User-agent: 008
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
Allow: /
    `;
  });

  router.get('/manifest.json', function * () {
    this.body = {
      name: 'reddit: the front page of the internet',
      icons: [
        {
          src: `${app.config.assetPath}/favicon/64x64.png`,
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/76x76.png`,
          sizes: '76x76',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/120x120.png`,
          sizes: '120x120',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/128x128.png`,
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/152x152.png`,
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/180x180.png`,
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: `${app.config.assetPath}/favicon/192x192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
      ],
      short_name: 'reddit',
      start_url: '/',
      scope: `${app.config.origin}`,
      lang: 'en-US',
      display: 'standalone',
    };
  });
}

export default serverRoutes;
