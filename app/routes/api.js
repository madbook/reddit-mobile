var request = require('request');

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

module.exports = function(app) {
  app.route('/api/*')
    .get(function(req, res) {
      var query = req.query;
      var headers = buildHeaders(req);

      var uri = app.V1Api(req).origin + '/' + req.params[0];

      var requestOptions = {
        uri: uri,
        qs: query,
        headers: headers,
      }

      request(requestOptions, function(err, response) {
        if(err) {
          return res.send(err);
        }

        var body = JSON.parse(response.body);

        res.json(body);
      })
    });
}

