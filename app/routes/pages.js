var React = require('react');
var _ = require('lodash');

var V1Api = require('snoode').v1;

module.exports = function(app) {
  var reddit = new V1Api({
    userAgent: 'switcharoo v0.0.1'
  });

  function buildProps(req, props) {
    var defaultProps = {
      csrf: req.csrfToken(),
      title: 'reddit: the front page of the internet',
      liveReload: app.config.liveReload,
      env: app.config.env,
      session: req.session
    };

    props = props || {};

    return _.defaults(props, defaultProps);
  }

  app.get('/', function(req, res) {
    var props = buildProps(req, { });
    var options = {}

    if (req.query.count && req.query.count <= 25) {
      options.count = req.query.count;
    }

    if (req.query.after) {
      options.after = req.query.after;
    }

    props.page = req.query.page || 0;

    reddit.links().get(options).done(function(data){
      props.listings = data;
      res.render('pages/index', props);
    });
  });

  app.get('/r/:subreddit', function(req, res) {
    var props = buildProps(req, { });

    var options = {
      subreddit: req.params.subreddit
    }

    if (req.query.count && req.query.count <= 25) {
      options.count = req.query.count;
    }

    if (req.query.after) {
      options.after = req.query.after;
    }

    props.page = req.query.page || 0;

    reddit.links().get(options).done(function(data){
      props.listings = data;

      props.hideSubredditLabel = true;

      res.render('pages/index', props);
    });
  });

  app.get('/r/:subreddit/comments/:listingId/:listingTitle', function(req, res) {
    var props = buildProps(req, { });

    function decodeHtmlEntities(html){
      return html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }

    function mapComment(comment) {
      if (!comment.body) {
        props.listing.more = comment;
      } else {
        comment.body_html = decodeHtmlEntities(comment.body_html);

        if (comment.replies){
          comment.replies = comment.replies.map(mapComment) || [];
        } else {
          comment.replies = [];
        }

        return comment;
      }
    }

    reddit.comments().get({
      linkId: req.params.listingId
    }).done(function(data){
      props.listing = data.listing;

      props.comments = data.comments.map(function(comment){
        return mapComment(comment, 0);
      });

      res.render('pages/listing', props);
    });
  });
}

