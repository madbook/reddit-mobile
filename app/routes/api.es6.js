import * as superagent from 'superagent';

var passableHeaders = [
  'user-agent',
  'accept-language',
  'authorization',
  'referer',
]

function buildHeaders (req) {
  var headers = {}
  for (var key in req.headers) {
    if (req.headers.hasOwnProperty(key) && passableHeaders.indexOf(key) > -1) {
      headers[key] = req.get(key)
    }
  }

  return headers;
}

var apiRoutes = function(app) {
  app.route('/api/*')
    .get(function(req, res) {
      var query = req.query || {};
      var headers = buildHeaders(req);

      var uri = app.V1Api(req).origin + '/' + req.params[0];

      superagent.get(uri)
        .query(query)
        .set(headers)
        .end(function(response) {
          if(!response.ok) {
            return res.send(err);
          }

          res.json(response.body);
        })
    });
}

export default apiRoutes;
