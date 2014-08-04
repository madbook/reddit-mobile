var React = require('react');
var _ = require('lodash');

module.exports = function(app) {
  function buildProps(req, props) {
    var defaultProps = {
      csrf: req.csrfToken(),
      title: 'reddit: the front page of the internet',
      liveReload: app.config.liveReload,
      env: app.config.env
    };

    props = props || {};

    return _.defaults(props, defaultProps);
  }

  app.get('/', function(req, res) {
    var props = buildProps(req, { });
    res.render('pages/index', props);
  });
}

