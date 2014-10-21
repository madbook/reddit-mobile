import * as React from 'react';
import * as  _ from 'lodash';
import * as q from 'q';
import * as querystring from 'querystring';
import * as lru from 'lru-cache';

import { models } from 'snoode';

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

  if (page && !req.session.token) {
    res.send(page);
  } else {
    fn(req).done(function(props) {
      app.render(template, props, function(err, str) {
        if (err) {
          throw(err);
        }

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

var pageRoutes = function(app) {
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

      app.V1Api(req).links.get(options).done(function(data){
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
        subredditName: req.params.subreddit
      });

      if (req.query.count && req.query.count <= 25) {
        options.query.count = req.query.count;
      }

      if (req.query.after) {
        options.query.after = req.query.after;
      }

      props.page = req.query.page || 0;

      app.V1Api(req).links.get(options).done(function(data){
        props.listings = data;

        props.hideSubredditLabel = true;

        defer.resolve(props);
      });

      return defer.promise;
    });
  });

  app.get('/r/:subreddit/comments/:listingId/:listingTitle/:commentId?', function(req, res) {
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

      options.linkId = req.params.listingId

      app.V1Api(req).comments.get(options).done(function(data){
        props.listing = data.listing;

        props.comments = data.comments.map(function(comment){
          return mapComment(comment, 0);
        });

        defer.resolve(props);
      });

      return defer.promise;
    });
  });

  app.route('/vote/:id')
    .all(function(req, res, next) {
      var endpoints = {
        '1': 'comment',
        '3': 'listing',
      }

      var id = req.params.id;
      var endpoint = endpoints[id[1]];

      var vote = new models.Vote({
        direction: parseInt(req.query.direction),
        id: id,
      });


      if (vote.get('direction') !== undefined && vote.get('id')) {
        var options = buildOptions(req, {
          model: vote,
        });

        app.V1Api(req).votes.post(options).done(function() {
          next();
        });
      } else {
        next();
      }
    })
    .get(function(req, res) {
      res.redirect('back');
    })
    .post(function(req, res) {
      res.status(204).send();
    })

  app.get('/vars', function(req, res) {
    var vars = {
      embedlyKey: app.config.embedlyKey,
    };

    res.send(JSON.stringify(vars));
  });
}

export default pageRoutes;
