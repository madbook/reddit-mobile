var React = require('react');
var _ = require('lodash');

module.exports = function(app) {
  function buildProps(req, props) {
    var defaultProps = {
      csrf: req.csrfToken()
    };

    props = props || {};

    return _.defaults(props, defaultProps);
  }

  app.get('/', function(req, res) {
    res.render('pages/index', buildProps(req, {}));
  });
}

