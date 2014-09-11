var React = require('react');
var _ = require('lodash');
var q = require('q');
var querystring = require('querystring');
var V1Api = require('snoode').v1;
var lru = require('lru-cache');

var shortCache = lru({
  max: 100,
  maxAge: 1000 * 10
});

var mediumCache = lru({
  max: 500,
  maxAge: 1000 * 30
});

// TODO: NOTE: NOT PROD READY, MEMORY, WILL DIE
function cache(template, cache, app, req, res, fn) {
  var cacheKey = req.url;
  var page = cache.get(cacheKey);

  if (page) {
    res.setHeader('Cache-Control', 'public, max-age=' + cache._maxAge / 1000);
    res.send(page);
  } else {
    fn(req).done(function(props) {
      app.render(template, props, function(err, str) {
        res.setHeader('Cache-Control', 'public, max-age=' + cache._maxAge / 1000);
        cache.set(cacheKey, str);
        res.send(str);
      });
    });
  }
}

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
    cache('pages/index', mediumCache, app, req, res, function(req) {
      var defer = q.defer();

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
        defer.resolve(props);
      });

      return defer.promise;
    });
  });

  app.get('/r/:subreddit', function(req, res) {
    cache('pages/index', mediumCache, app, req, res, function(req) {
      var defer = q.defer();

      var props = buildProps(req, { });

      var options = {
        subredditName: req.params.subreddit
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

        defer.resolve(props);
      });

      return defer.promise;
    });
  });

  app.get('/r/:subreddit/comments/:listingId/:listingTitle', function(req, res) {
    cache('pages/listing', shortCache, app, req, res, function(req) {
      var defer = q.defer();

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

        defer.resolve(props);
      });

      return defer.promise;
    });
  });
}

