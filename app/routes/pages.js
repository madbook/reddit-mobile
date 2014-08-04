require('node-jsx').install({extension: '.jsx'})

var React = require('react');

var persephone = require('../jsx/app');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    var props = {
      csrf: req.csrfToken()
    };

    var html = React.renderComponentToString(persephone(props));
    res.end(html);
  });
}

