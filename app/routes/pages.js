var React = require('react');
var _ = require('lodash');
var q = require('q');
var querystring = require('querystring');
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
  var cacheKey = buildCacheKey(req);
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

function buildCacheKey(req) {
  var key = req.url; //includes querystring

  if(req.session.token) {
    key += '&token=' + req.session.token;
  }

  return key;
}

module.exports = function(app) {
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

  function buildOptions(req, options) {
    options.query = options.query || {};
    options.headers = options.headers || {};

    if(req.session.token) {
      options.headers.Authorization = 'bearer ' + req.session.token.access_token
    }

    return options;
  }

  app.get('/', function(req, res) {
    cache('pages/index', mediumCache, app, req, res, function(req) {
      var defer = q.defer();

      var props = buildProps(req, { });
      var options = buildOptions(req, {});

      if (req.query.count && req.query.count <= 25) {
        options.query.count = req.query.count;
      }

      if (req.query.after) {
        options.query.after = req.query.after;
      }

      props.page = req.query.page || 0;

      app.V1Api(req).links().get(options).done(function(data){
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

      var options = buildOptions(req, {
        query: {
          subredditName: req.params.subreddit
        }
      });

      if (req.query.count && req.query.count <= 25) {
        options.query.count = req.query.count;
      }

      if (req.query.after) {
        options.query.after = req.query.after;
      }

      props.page = req.query.page || 0;

      app.V1Api(req).links().get(options).done(function(data){
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
      var options = buildOptions(req, {});

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

      app.V1Api(req).comments().get({
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

