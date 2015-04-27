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
Allow: /
    `;
  });
}

export default serverRoutes;
