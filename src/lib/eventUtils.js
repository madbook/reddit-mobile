import omit from 'lodash/omit';
import values from 'lodash/values';
import url from 'url';

import {
  interstitialType,
  isPartOfXPromoExperiment,
  currentExperimentData as currentXPromoExperimentData,
  xpromoIsEnabledOnDevice,
  commentsInterstitialEnabled,
  isEligibleListingPage,
  isEligibleCommentsPage,
} from 'app/selectors/xpromo';

import {
  buildAdditionalEventData as listingPageEventData,
} from 'app/router/handlers/PostsFromSubreddit';
import {
  buildAdditionalEventData as commentsPageEventData,
} from 'app/router/handlers/CommentsPage';

import isFakeSubreddit from 'lib/isFakeSubreddit';
import { getEventTracker } from 'lib/eventTracker';
import * as gtm from 'lib/gtm';
import { hasAdblock } from 'lib/adblock';
import { shouldNotShowBanner } from 'lib/smartBannerState';

export const XPROMO_VIEW = 'cs.xpromo_view';
export const XPROMO_INELIGIBLE = 'cs.xpromo_ineligible';
export const XPROMO_DISMISS = 'cs.xpromo_dismiss';
export const XPROMO_SCROLLUP = 'cs.xpromo_scrollup';
export const XPROMO_SCROLLPAST = 'cs.xpromo_scrollpast';
export const XPROMO_APP_STORE_VISIT = 'cs.xpromo_app_store_visit';

const ID_REGEX = /(?:t\d+_)?(.*)/;

export function removePrefix(prefixedId) {
  return ID_REGEX.exec(prefixedId)[1];
}

export function convertId(id) {
  return parseInt(removePrefix(id), 36);
}

function getSubredditFromState(state) {
  const { subredditName } = state.platform.currentPage.urlParams;

  if (subredditName && !isFakeSubreddit(subredditName)) {
    return state.subreddits[subredditName.toLowerCase()];
  }
}

export function buildSubredditData(state) {
  const subreddit = getSubredditFromState(state);

  if (!subreddit) {
    return {};
  }

  return {
    sr_id: convertId(subreddit.name),
    sr_name: subreddit.displayName,
  };
}

export function getListingName(state) {
  const urlName = state.platform.currentPage.urlParams.subredditName;
  const subreddit = getSubredditFromState(state);
  const listingName = subreddit && subreddit.displayName || urlName || 'frontpage';
  return { 'listing_name': listingName };
  // we don't support multis yet but we will need to update this when we do.
}

export function getUserInfoOrLoid(state) {
  const user = state.user;
  const userInfo = state.accounts[user.name];
  if (userInfo && !user.loggedOut) {
    return {
      'user_id': convertId(userInfo.id),
      'user_name': user.name,
    };
  }

  const loid = state.loid;
  return {
    'loid': loid.loid,
    'loid_created': loid.loidCreated,
  };
}

function getDomain(referrer, meta) {
  const x = url.parse(referrer);
  return x.host || meta.domain;
}

export function getBasePayload(state) {
  // NOTE: this is only for usage on the client since it has references to window
  const { platform, meta, compact, preferences } = state;
  const referrer = platform.currentPage.referrer;

  const payload = {
    domain: meta.domain,
    geoip_country: meta.country,
    user_agent: meta.userAgent,
    base_url: platform.currentPage.url,
    referrer_domain: referrer ? getDomain(referrer, meta) : '',
    referrer_url: referrer,
    language: preferences.lang,
    dnt: !!window.DO_NOT_TRACK,
    compact_view: compact,
    adblock: hasAdblock(),
    ...getUserInfoOrLoid(state),
  };

  return payload;
}

function trackScreenViewEvent(state, additionalEventData) {
  const payload = {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    ...additionalEventData,
  };
  getEventTracker().track('screenview_events', 'cs.screenview_mweb', payload);
}

export function xPromoExtraScreenViewData(state) {
  // ensure that we get all of the extra screen view events data that's
  // present on comments and listings pages
  let extraPageData = {};
  if (isEligibleListingPage(state)) {
    extraPageData = listingPageEventData(state);
  } else if (isEligibleCommentsPage(state)) {
    extraPageData = commentsPageEventData(state);
  }

  return extraPageData;
}

export function trackXPromoEvent(state, eventType, additionalEventData) {
  const payload = {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    ...getExperimentPayload(state),
    ...xPromoExtraScreenViewData(state),
    ...additionalEventData,
  };

  return new Promise((resolve) => {
    getEventTracker()
      .replaceToNewSend()
      .addDoneToNewSend(() => resolve())
      .track('xpromo_events', eventType, payload);
  });
}

function getExperimentPayload(state) {
  let experimentPayload = {};
  if (isPartOfXPromoExperiment(state) && currentXPromoExperimentData(state)) {
    const { experiment_name, variant } = currentXPromoExperimentData(state);
    experimentPayload = { experiment_name, experiment_variant: variant };
  }
  return experimentPayload;
}


export function trackXPromoView(state, additionalEventData) {
  trackXPromoEvent(state, XPROMO_VIEW, {
    ...additionalEventData,
    interstitial_type: interstitialType(state),
  });
}

export function trackXPromoIneligibleEvent(state, additionalEventData, ineligibilityReason) {
  trackXPromoEvent(state, XPROMO_INELIGIBLE, {
    ...additionalEventData,
    ineligibility_reason: ineligibilityReason,
  });
}

export function trackPagesXPromoEvents(state, additionalEventData) {
  if (isEligibleListingPage(state)) {
    const ineligibilityReason = shouldNotShowBanner();
    if (ineligibilityReason) {
      trackXPromoIneligibleEvent(state, additionalEventData, ineligibilityReason);
    } else if (xpromoIsEnabledOnDevice(state)) {
      // listing pages always track view events because they'll either see
      // the normal xpromo, or the login required variant
      trackXPromoView(state, additionalEventData);
    }
  } else if (isEligibleCommentsPage(state)) {
    const ineligibilityReason = shouldNotShowBanner();
    if (ineligibilityReason) {
      trackXPromoIneligibleEvent(state, additionalEventData, ineligibilityReason);
      // otherwise check if this is a valid page, and the comments page
      // xpromo is enabled.
    } else if (xpromoIsEnabledOnDevice(state) && commentsInterstitialEnabled(state)) {
      trackXPromoView(state, additionalEventData);
    }
  }
}

export function trackExperimentClickEvent(state, experimentName, experimentId, targetThing) {
  const payload = {
    ...getBasePayload(state),
    'experiment_name': experimentName,
    'experiment_id': experimentId,
    'target_fullname': targetThing.name,
    'target_url': targetThing.url,
    'target_type': targetThing.type === 'post' ? targetThing.isSelf ? 'self' : 'link' : targetThing.type,
    'target_id': convertId(targetThing.id),
    'target_name': targetThing.type === 'subreddit' ? targetThing.displayName : undefined,
  };
  getEventTracker().track('internal_click_events', 'cs.experiment_click', payload);
}

function trackCrawlEvent(state, additionalEventData) {
  const { protocol, method, crawler, userAgent, domain } = state.meta;

  const payload = {
    params_app: 'mweb',
    http_response_code: state.platform.currentPage.status,
    // (skrisman | 10.17.2016) consider how we can get a response_time here
    // (skrisman | 10.17.2016) is there a concept like "server" that we have?
    crawler_name: crawler,
    method,
    protocol,
    domain,
    user_agent: userAgent,
    base_url: state.platform.currentPage.url,
    ...additionalEventData,
  };

  getEventTracker().track('crawl_events', 'url_crawl', payload);
}


const IGNORE_PARAMS = ['overlayMenu', 'commentReply'];
let lastUrlToken = null;

function isDuplicatePageView(state) {
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
    return false;
  }
  return true;
}

export function trackPageEvents(state, additionalEventData={}) {
  if (isDuplicatePageView(state)) {
    return;
  }

  if (process.env.ENV === 'client') {
    gtmPageView(state);
    trackScreenViewEvent(state, additionalEventData);
    trackPagesXPromoEvents(state, additionalEventData);
  } else if (state.meta.crawler) {
    trackCrawlEvent(state, additionalEventData);
  }
}

export function trackPreferenceEvent(state, additionalEventData={}) {
  const payload = {
    ...getBasePayload(state),
    ...additionalEventData,
  };
  getEventTracker().track('user_preference_events', 'cs.save_preference_cookie', payload);
}

const gtmPageView = state => {
  const subreddit = getSubredditFromState(state);
  const userInfo = getUserInfoOrLoid(state);

  gtm.trigger('pageview', {
    userId: userInfo.user_id,
    subreddit: subreddit ? subreddit.displayName : null,
    pathname: state.platform.currentPage.url || '/',
    advertiserCategory: subreddit ? subreddit.advertiserCategory : null,
  });
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
