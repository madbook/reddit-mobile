import querystring from 'querystring';
import crypto from 'crypto';
import EventTracker from 'event-tracker';
import omit from 'lodash/object/omit';

import constants from '../../src/constants';
import addIfPresent from '../../src/lib/addIfPresent';
import makeRequest from '../../src/lib/makeRequest';
import url from 'url';
import gtm from './gtm';

const { NIGHTMODE } = constants.themes;

// Build a regex which can pull the base36 out of a prefixed or unprefixed id.
const idRegex = /(?:t\d+_)?(.*)/;

function calculateHash (key, string) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.setEncoding('hex');
  hmac.write(string);
  hmac.end();

  return hmac.read();
}

function postData(eventInfo) {
  const { url, data, query, headers } = eventInfo;

  makeRequest
    .post(url)
    .set(headers)
    .query(query)
    .timeout(constants.DEFAULT_API_TIMEOUT)
    .send(data)
    .then();
}

function trackingEvents(app) {
  let tracker;
  app.eventQueue = [];

  if (app.config.trackerClientSecret) {
    let trackerSecret = app.config.trackerClientSecret || '';
    trackerSecret = new Buffer(trackerSecret, 'base64').toString();

    tracker = new EventTracker(
      app.config.trackerKey,
      trackerSecret,
      postData,
      app.config.trackerEndpoint,
      app.config.trackerClientAppName,
      calculateHash
    );
  }

  function eventSend(topic, type, payload) {
    if (tracker) {
      if (app.getState('loaded')) {
        return tracker.track(topic, type, payload);
      }

      app.eventQueue.push([topic, type, payload]);
    }
  }

  function clearEventQueue() {
    if (app.eventQueue.length) {
      app.eventQueue.forEach((e) => {
        eventSend(...e);
      });
    }
  }

  function gaSend () {
    if (global && global.ga) {
      global.ga.apply(null, [...arguments]);
    }
  }

  function convertId (id) {
    const unprefixedId = idRegex.exec(id)[1];
    return parseInt(unprefixedId, 36);
  }

  function isOtherListing(props) {
    return props.ctx.params.subreddit || props.ctx.params.multi ||
      props.ctx.path === '/';
  }

  function buildPageviewData (props) {
    const LINK_LIMIT = 25;


    const data = {
      language: 'en', // NOTE: update when there are translations
    };

    if (props.ctx.referrer) {
      data.referrer_url = props.ctx.referrer;
      data.referrer_domain = url.parse(props.ctx.referrer).host;
    }

    data.dnt = !!window.DO_NOT_TRACK;

    // If there is a logged-in user, add the user's data to the payload
    if (props.data.user) {
      data.user_name = props.data.user.name;
      data.user_id = convertId(props.data.user.id);
    } else {
      // Otherwise, send in logged-out ID
      data.loid = props.loid;
      data.loid_created = props.loidcreated;
    }

    // If we're looking at a subreddit, include the info in the payload
    if (props.data.subreddit) {
      data.sr_id = convertId(props.data.subreddit.name);
      data.sr_name = props.data.subreddit.id;
    }

    // If we're looking at a list of links or comments, include the sort order
    // (or a default). If it's just a list of links, not comments, also include
    // the page size.
    if (props.data.listings || props.data.search || props.data.activities || props.data.comments) {
      if (props.ctx.query.sort === 'top') {
        data.target_filter_time = props.ctx.query.time || 'all';
      }

      if (props.data.comments || props.data.activities) {
        data.target_sort = props.ctx.query.sort || 'confidence';
      } else {
        data.target_sort = props.ctx.query.sort || 'hot';
        data.target_count = LINK_LIMIT;

        const query = props.ctx.query;
        if (query.before) {
          data.target_before = query.before;
        }

        if (query.after) {
          data.target_after = query.after;
        }
      }

      if (props.data.search && props.ctx.query.q) {
        data.query_string = props.ctx.query.q;
        data.query_string_length = props.ctx.query.q.length;
      }

      if (props.data.search) {
        data.sr_listing = props.data.search.subreddits.map(sr => sr.display_name);
        data.target_type = 'search_results';
      }
    }

    // Try looking at the data to determine what the subject of the page is.
    // In order of priority, it could be a user profile, a listing, or a
    // subreddit.
    const target = (
      props.data.userProfile ||
      props.data.listing ||
      props.data.subreddit
    );

    data.compact_view = props.compact;

    if (props.theme === NIGHTMODE) {
      data.nightmode = true;
    }

    if (target) {
      // Subreddit ids/names are swapped
      if (props.ctx.params.commentId) {
        data.target_id = convertId(props.ctx.params.commentId);
        data.target_fullname = `t1_${props.ctx.params.commentId}`;
        data.target_type = 'comment';
      } else if (target._type === 'Subreddit') {
        data.target_id = convertId(target.name);
        data.target_fullname = `${target.name}`;
        data.target_type = 'listing';
        data.listing_name = target.id;
      } else if (target._type === 'Link') {
        data.target_id = convertId(target.id);
        data.target_fullname = `t3_${target.id}`;
        data.target_type = 'link';
        if (target.selftext) {
          data.target_type = 'self';
        }
      } else if (target._type === 'Account') {
        data.target_id = convertId(target.id);
        data.target_name = target.name;
        data.target_fullname = `t2_${target.id}`;
        data.target_type = 'account';
      }

      if (target._type === 'Link') {
        data.target_url = target.url;
        data.target_url_domain = target.domain;
      }
    } else if (isOtherListing(props)) {
      // Fake subreddit, mark it as a listing
      data.target_type = 'listing';

      // explicitly check that this is the frontpage
      if (props.ctx.path === '/') {
        data.listing_name = 'frontpage';
      } else if (props.ctx.params.subreddit) {
        const subreddit = props.ctx.params.subreddit;
        if (subreddit.indexOf('+') !== -1) {
          data.listing_name = 'multi';
        } else {
          data.listing_name = subreddit;
        }
      } else if (props.ctx.params.multi) {
        data.listing_name = 'multi';
      }
    }

    return data;
  }

  function getBasePayload(props) {
    const ctx = props.ctx || {};
    const referrer = ctx.referrer || '';
    const domain = window.location.host;
    return {
      domain,
      geoip_country: props.country ||
                     props.app.getState('country') || null,
      user_agent: ctx.userAgent || '',
      referrer_domain: url.parse(referrer).host || domain,
      referrer_url: referrer,
    };
  }

  function buildLoginData(props) {
    const payload = {
      ...getBasePayload(props),
      successful: props.successful,
      user_name: props.user.name,
    };

    addIfPresent(payload, 'user_id', convertId(props.user.id));
    addIfPresent(payload, 'loid', props.loid);
    addIfPresent(payload, 'loid_created', props.loidcreated);
    addIfPresent(payload, 'process_notes', props.process_notes);
    addIfPresent(payload, 'email', props.email);
    addIfPresent(payload, 'email_verified', props.has_verified_email);

    // originalUrl can only be a relative url
    if (props.originalUrl) {
      payload.referrer_domain = payload.domain;
      payload.referrer_url = payload.domain + props.originalUrl;
    }

    return payload;
  }

  function handleLogin(props) {
    const { data, ctx, app } = props;
    if (data.user) {
      const notifications = ctx.notifications || [];

      const loginAction = notifications.find((v) => {
        return v === 'login' || v === 'register';
      });

      if (loginAction) {
        const eventProps = {
          ...props,
          user: data.user,
          successful: true,
          country: app.getState('country'),
          // We get redirected to the referrer (in app only) after
          // successful login so we know it was the current route.
          originalUrl: ctx.path,
        };

        app.emit(`${loginAction}:attempt`, eventProps);
      }
    }
  }

  function buildCommentData(props) {
    const { subreddit, subreddit_id, author,
            name, body, link_id, parent_id } = props.comment;
    const payload = {
      ...getBasePayload(props),
      user_name: author,
      user_id: convertId(props.user.id),
      sr_name: subreddit,
      sr_id: convertId(subreddit_id),
      comment_id: convertId(name),
      comment_fullname: name,
      comment_body: body,
      parent_id: convertId(parent_id),
      parent_fullname: parent_id,
      parent_created_ts: props.parentCreated,
      post_id: convertId(link_id),
      post_fullname: link_id,
      post_created_ts: props.postCreated,
    };

    return payload;
  }

  function buildSubmitData(props) {
    const { post, user } = props;
    const payload = {
      ...getBasePayload(props),
      user_id: convertId(user.id),
      user_name: user.name,
      sr_name: post.sr,
      post_id: convertId(post.id),
      post_fullname: post.name,
      post_title: post.title,
      post_type: post.kind,
    };

    addIfPresent(payload, 'post_target_url', post.url);
    addIfPresent(payload, 'post_target_domain', url.parse(post.url).host);
    addIfPresent(payload, 'post_body', post.text);
    addIfPresent(payload, 'sr_id', convertId(props.subreddit.name));

    return payload;
  }

  app.on('pageview', function(props) {
    const payload = buildPageviewData(props);
    app.setState('loaded', true);
    eventSend('screenview_events', 'cs.screenview', payload);
    handleLogin(props);
    clearEventQueue();
    gtm.trigger('pageview', {
      subreddit: props.ctx.params.subreddit || '',
      pathname: props.ctx.path || '/',
    });
  });

  app.on('route:start', function(ctx) {
    // app 'loaded' state is used to check if we should queue all events other than
    // pageview to ensure pageview is first
    app.setState('loaded', false);

    const query = querystring.stringify(ctx.query);
    let fullUrl = ctx.path;

    if (query) {
      fullUrl += `?${query}`;
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

  app.on('login:attempt', function(props) {
    const payload = buildLoginData(props);
    eventSend('login_events', 'cs.login_attempt', payload);
    gaSend('send', 'event', 'login', 'attempt');
  });

  app.on('register:attempt', function(props) {
    const payload = buildLoginData(props);
    eventSend('login_events', 'cs.register_attempt', payload);
    gaSend('send', 'event', 'register', 'attempt');
  });

  app.on('vote', function(vote) {
    gaSend('send', 'event', 'vote', vote.get('direction'));
  });


  app.on('comment:new', function (props) {
    const payload = buildCommentData(props);
    eventSend('comment_events', 'cs.comment', payload);

    if (props.comment.text) {
      gaSend('send', 'event', 'comment', 'words', props.comment.text.match(/\S+/g).length);
    }
  });

  app.on('comment:edit', function() {
    gaSend('send', 'event', 'comment', 'edit');
  });

  app.on('search', function() {
    gaSend('send', 'event', 'search');
  });

  app.on('goto', function(query) {
    gaSend('send', 'event', 'goto', query);
  });

  app.on('report', function() {
    gaSend('send', 'event', 'report');
  });

  app.on('post:submit', function(eventData) {
    const payload = buildSubmitData(eventData);
    eventSend('submit_events', 'cs.submit', payload);

    gaSend('send', 'event', 'post', 'submit', eventData.post.sr);
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
    if (message.text) {
      gaSend('send', 'event', 'messages', 'reply', message.text.match(/\S+/g).length);
    }
  });

  app.on('searchBar', function(payload) {
    // this isn't a pageview, but it still needs to send many of the same fields,
    // so go ahead and treat it like a pageview
    const data = {
      ...omit(payload, 'type'),
      ...buildPageviewData(omit(payload, 'type')),
    };

    eventSend('search_events', payload.type, data);
  });

  app.on('bucket', function (data) {
    const { experiment_id, experiment_name, variant, loid, loidcreated } = data;
    const payload = {
      experiment_id,
      experiment_name,
      variant,
      loid,
      loid_created: loidcreated,
      loid_new: false,
    };

    eventSend('bucketing_events', 'bucket', payload);
  });

  app.on('click:experiment', function (data) {
    const {
      eventType,
      loid,
      loidcreated: loid_created,
      experimentName: experiment_name,
      listingName: listing_name,
      linkIndex: link_index,
      linkName: link_name,
      refererPageType: referer_page_type,
      targetId: target_id,
      targetFullname: target_fullname,
      targetUrl: url,
      targetName: target_name,
      targetType: target_type,
      userId: user_id,
      userName: user_name,
    } = data;

    const URL = window.URL || window.webkitURL;
    let target_url;
    if (URL) {
      target_url = (new URL(url, window.location.href)).href;
    } else {
      target_url = url;
    }


    const payload = {
      app_name: 'm.reddit.com',
      // path (after reddit.com) from which the event is sent
      // (eg. /r/BeachParty/new)
      experiment_name,
      listing_name, // "frontpage", "all", or a subreddit name.
      link_index, // top link is 1
      link_name, // human-readable name of the link clicked
      loid,
      loid_created,
      referer_page_type, // "listing", "link", "self", "comment"
      target_id, // base-10 id of the target (used for subreddits only)
      // fullname (prefix+base-36 id) of the content at the target location
      // Currently skipped for subreddit targets to circumvent a data
      // processing issue
      target_fullname,
      target_url, // clickthrough url of the click
      // human-readable name of the target (only applicable to subreddits)
      target_name,
      target_type, // "subreddit", "link", "self", "subscribe"
      user_id, // base-10 user id
      user_name, // human-readable name of the user sending the event
    };
    eventSend('internal_click_events', eventType, payload);
  });
}

export default trackingEvents;
