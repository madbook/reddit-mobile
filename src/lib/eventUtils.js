import omit from 'lodash/omit';
import values from 'lodash/values';
import url from 'url';

import isFakeSubreddit from 'lib/isFakeSubreddit';
import { getEventTracker } from 'lib/eventTracker';

const ID_REGEX = /(?:t\d+_)?(.*)/;

export function convertId(id) {
  const unprefixedId = ID_REGEX.exec(id)[1];
  return parseInt(unprefixedId, 36);
}


export function buildSubredditData(state) {
  const { subredditName } = state.platform.currentPage.urlParams;

  if (!isFakeSubreddit(subredditName)) {
    const subreddit = state.subreddits[subredditName.toLowerCase()];
    return {
      sr_id: convertId(subreddit.name),
      sr_name: subreddit.uuid,
    };
  }
  return {};
}


export function getBasePayload(state) {
  // NOTE: this is only for usage on the client since it has references to window
  const { user, accounts } = state;
  const referrer = state.platform.currentPage.referrer || '';
  const domain = window.location.host;

  const userAccount = user.loggedOut ? null : accounts[user.name];

  const payload = {
    domain,
    geoip_country: state.meta.country,
    user_agent: state.meta.userAgent,
    referrer_domain: url.parse(referrer).host || domain,
    referrer_url: referrer,
    language: state.preferences.lang,
    dnt: !!window.DO_NOT_TRACK,
    compact_view: state.compact,
  };

  if (userAccount) {
    payload.user_name = userAccount.name;
    payload.user_id = convertId(userAccount.id);
  } else {
    payload.loid = state.loid.loid;
    payload.loid_created = state.loid.loidCreated;
  }

  return payload;
}



const IGNORE_PARAMS = ['overlayMenu', 'commentReply'];
let lastUrlToken = null;

export function logClientScreenView(buildScreenViewData, state) {
  // NOTE: This block is a total hack to fix multiple pageviews. The way it
  // works is by normalizing urls and their parameters. If a query parameter
  // is in the ignore list, then it doesn't dirty the url and doesn't
  // contribute to a page view.
  // DELETE after ephemeral views having urls is fixed.
  const paramToken = values(omit(state.platform.currentPage.queryParams, IGNORE_PARAMS))
    .sort()
    .join('-');

  const urlToken = state.platform.currentPage.url + paramToken;
  if (urlToken !== lastUrlToken) {
    lastUrlToken = urlToken;
  } else {
    return;
  }
  // end hack

  if (process.env.ENV === 'client') {
    getEventTracker().track(
      'screenview_events',
      'cs.screenview_mweb',
      buildScreenViewData(state),
    );
  }
}
