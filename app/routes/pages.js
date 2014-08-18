var React = require('react');
var _ = require('lodash');

var Snoocore = require('snoocore');

module.exports = function(app) {
  var reddit = new Snoocore({ userAgent: 'switcharoo v0.0.1' });

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

    reddit('/hot').get().done(function(data){
      props.listings = data.data.children.map(function(c){
        return c.data;
      });

      res.render('pages/index', props);
    });
  });
}

