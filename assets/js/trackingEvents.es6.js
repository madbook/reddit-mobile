import querystring from 'querystring';
import crypto from 'crypto'
import superagent from 'superagent';
import EventTracker from 'event-tracker';

function calculateHash (key, string) {
  let hmac = crypto.createHmac('sha1', key);
  hmac.setEncoding('hex');
  hmac.write(string);
  hmac.end();

  return hmac.read();
}

function postData(eventInfo) {
  const { url, data, query, headers } = eventInfo;

  superagent
    .post(url)
    .set(headers)
    .query(query)
    .send(data)
    .end(function(){});
}

function trackingEvents(app) {
  const tracker = new EventTracker(
    app.config.trackerKey,
    postData,
    app.config.trackerEndpoint,
    app.config.trackerClientName,
    calculateHash
  );

  function eventSend(topic, type, payload) {
    if (tracker) {
      tracker.track(topic, type, payload);
    }
  }

  function gaSend () {
    if (global && global.ga) {
      global.ga.apply(null, [...arguments]);
    }
  }

  app.on('route:start', function(ctx) {
    const query = querystring.stringify(ctx.query);
    let fullUrl = ctx.path;

    if (query) {
      fullUrl += '?' + query;
    }

    gaSend('set', 'page', fullUrl);
    gaSend('send', 'pageview');

    const loggedIn = !!window.bootstrap.user;

    const compactCookieValue = document.cookie.match(/\bcompact=(\w+)\b/);
    const compact = !!(compactCookieValue &&
                    compactCookieValue.length > 1 &&
                    compactCookieValue[1] === 'true');

    const compactTestCookieValue = document.cookie.match(/\bcompactTest=(\w+)\b/);
    const compactTest = compactTestCookieValue ? compactTestCookieValue[1] : 'undefined';


    gaSend('set', 'dimension2', loggedIn.toString());
    gaSend('set', 'dimension3', compact.toString());
    gaSend('set', 'dimension4', compactTest.toString());
  });

  app.on('compactToggle', function (compact) {
    gaSend('send', 'event', 'compactToggle', compact.toString());
    gaSend('set', 'dimension3', compact.toString());
  });

  app.on('vote', function (vote) {
    gaSend('send', 'event', 'vote', vote.get('direction'));
  });

  app.on('comment', function (comment) {
    gaSend('send', 'event', 'comment', 'words', comment.get('text').match(/\S+/g).length);
  });

  app.on('comment:edit', function() {
    gaSend('send', 'event', 'comment', 'edit');
  });

  app.on('search', function (query) {
    gaSend('send', 'event', 'search');
  });

  app.on('goto', function (query) {
    gaSend('send', 'event', 'goto', query);
  });

  app.on('report', function (query) {
    gaSend('send', 'event', 'report');
  });

  app.on('post:submit', function(subreddit) {
    gaSend('send', 'event', 'post', 'submit', subreddit);
  });

  app.on('post:edit', function() {
    gaSend('send', 'event', 'post', 'edit');
  });

  app.on('post:selectSubreddit', function(subreddit) {
    gaSend('send', 'event', 'post', 'selectSubreddit', subreddit);
  });

  app.on('post:error', function() {
    gaSend('send', 'event', 'post', 'captcha');
  });

  app.on('message:submit', function() {
    gaSend('send', 'event', 'messages', 'submit');
  });

  app.on('message:reply', function(message) {
    gaSend('send', 'event', 'messages', 'reply', message.get('text').match(/\S+/g).length);
  });
}

export default trackingEvents;
