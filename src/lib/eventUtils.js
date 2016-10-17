import omit from 'lodash/omit';
import values from 'lodash/values';
import url from 'url';

import { ADBLOCK_TEST_ID } from 'app/constants';

import { isHidden } from 'lib/dom';
import isFakeSubreddit from 'lib/isFakeSubreddit';
import { getEventTracker } from 'lib/eventTracker';
import * as gtm from 'lib/gtm';

const ID_REGEX = /(?:t\d+_)?(.*)/;

export function convertId(id) {
  const unprefixedId = ID_REGEX.exec(id)[1];
  return parseInt(unprefixedId, 36);
}


export function buildSubredditData(state) {
  const { subredditName } = state.platform.currentPage.urlParams;

  if (isFakeSubreddit(subredditName)) { return {}; }

  const subreddit = state.subreddits[subredditName.toLowerCase()];
  if (!subreddit) { return {}; }

  return {
    sr_id: convertId(subreddit.name),
    sr_name: subreddit.uuid,
  };
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
    base_url: state.platform.currentPage.url,
    referrer_domain: url.parse(referrer).host || domain,
    referrer_url: referrer,
    language: state.preferences.lang,
    dnt: !!window.DO_NOT_TRACK,
    compact_view: state.compact,
    adblock: hasAdblock(),
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
    const data = buildScreenViewData(state);
    if (data) {
      getEventTracker().track('screenview_events', 'cs.screenview_mweb', data);
    }

    gtmPageView(state);
  }
}

const gtmPageView = state => {
  const { platform: { currentPage }} = state;

  gtm.trigger('pageview', {
    subreddit: currentPage.urlParams.subredditName || '',
    pathname: currentPage.url || '/',
  });
};


const hasAdblock = () => {
  const adblockTester = document.getElementById(ADBLOCK_TEST_ID);
  // If the div has been removed, they have adblock
  if (!adblockTester) { return true; }

  const rect = adblockTester.getBoundingClientRect();
  if (!rect || !rect.height || !rect.width) {
    return true;
  }

  return isHidden(adblockTester);
};

// Tracks the active blocking of an ad
// method is how the ad was blocked
// placementIndex is the position in the listview
// state is the entire redux state
export const logClientAdblock = (method, placementIndex, state) => {
  if (process.env.ENV !== 'client') { return; }

  const payload = {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    method,
    placement_type: 'native',
    placement_index: placementIndex,
    in_feed: placementIndex !== 0,
  };

  getEventTracker().track('ad_serving_events', 'cs.adblock', payload);
};
