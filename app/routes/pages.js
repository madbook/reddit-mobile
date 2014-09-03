var React = require('react');
var _ = require('lodash');

var Snoocore = require('snoocore');

module.exports = function(app) {
  var reddit = new Snoocore({
    userAgent: 'switcharoo v0.0.1',
    oauth: {
      type: 'web',
      mobile: true,
      duration: 'permanent',
      consumerKey: app.config.oauth.clientId,
      consumerSecret: app.config.oauth.secret,
      redirectUri: app.config.origin + '/oauth2/token',
      // load ALL the scopes
      scope: [ 'modposts', 'identity', 'edit', 'flair', 'history', 'modconfig', 'modflair', 'modlog', 'modposts', 'modwiki', 'mysubreddits', 'privatemessages', 'read', 'report', 'save', 'submit', 'subscribe', 'vote', 'wikiedit', 'wikiread']
    }
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

    reddit('/hot').get(options).done(function(data){
      props.listings = data.data.children.map(function(c){
        return c.data;
      });

      res.render('pages/index', props);
    });
  });

  app.get('/r/:subreddit', function(req, res) {
    var props = buildProps(req, { });
    var options = {
      $subreddit: req.params.subreddit
    }

    if (req.query.count && req.query.count <= 25) {
      options.count = req.query.count;
    }

    if (req.query.after) {
      options.after = req.query.after;
    }

    props.page = req.query.page || 0;

    reddit.r.$subreddit.hot.get(options).done(function(data){
      props.listings = data.data.children.map(function(c){
        return c.data;
      });

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
      var data = comment.data;

      if (!data.body) {
        props.listing.more = data;
      } else {
        data.body_html = decodeHtmlEntities(data.body_html);

        if (data.replies){
          data.replies = data.replies.data.children.map(mapComment) || [];
        } else {
          data.replies = [];
        }

        return data;
      }
    }

    reddit.comments.$article.get({
      $article: req.params.listingId
    }).done(function(data){
      props.listing = data[0].data.children[0].data;

      props.comments = data[1].data.children.map(function(comment){
        return mapComment(comment, 0);
      });

      res.render('pages/listing', props);
    });
  });

  app.get('/login', function(req, res) {
    res.redirect(reddit.getAuthUrl(req.csrfToken()));
  });

  app.get('/oauth2/token', function(req, res) {
    var code = req.query.code;
    var state = req.query.state;

    reddit.auth(code).then(function(refreshToken) {
      req.session.token = refreshToken;

      reddit.api.v1.me.get().then(function(user) {
        req.session.user = user;
        res.redirect('/');
      });
    })
  });
}

