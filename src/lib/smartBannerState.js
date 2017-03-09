import url from 'url';
import cookies from 'js-cookie';

import config from 'config';
import localStorageAvailable from './localStorageAvailable';
import {
  getBasePayload,
  buildSubredditData,
  xPromoExtraScreenViewData,
} from 'lib/eventUtils';

import { LISTING_CLICK_TYPES } from 'app/constants';

import {
  currentExperimentData,
  getFrequencyExperimentData,
  isPartOfXPromoExperiment,
  interstitialType,
} from 'app/selectors/xpromo';

import features from 'app/featureFlags';
import { experimentFrequencyVariants as frequency, localstorage, EVERY_TWO_WEEKS } from 'app/constants';
import { XPROMO_LAST_LISTING_CLICK_DATE, flags } from 'app/constants';
const { XPROMO_LISTING_CLICK_EVERY_TIME_COHORT } = flags;
const { BANNER_LAST_CLOSED } = localstorage;

// Get loid values either from the account state or the cookies.
function getLoidValues(accounts) {
  if (accounts.me) {
    return {
      loid: accounts.me.loid,
      loidCreated: accounts.me.loidCreated,
    };
  }

  const loid = cookies.get('loid');
  const loidCreated = cookies.get('loidcreated');

  return {
    loid,
    loidCreated,
  };
}

export function getXPromoLinkforCurrentPage(state, linkType) {
  const path = window.location.href.split(window.location.host)[1];
  return getXPromoLink(state, path, linkType);
}

export function getXPromoListingClickLink(state, postId, listingClickType) {
  const post = state.posts[postId];
  if (!post) {
    throw new Error(`XPromoListingClickLink called with invalid postId: ${postId}`);
  }

  const path = getXPromoListingClickPath(state, post, listingClickType);

  return getXPromoLink(state, path, 'listing_click', {
    listing_click_type: listingClickType,
  });
}

function getXPromoListingClickPath(state, post, listingClickType) {
  switch (listingClickType) {
    case LISTING_CLICK_TYPES.AUTHOR: {
      const { author } = post;
      // note: android has problems with /user/, so keep this as /u/
      return `/u/${author}`;
    }

    case LISTING_CLICK_TYPES.SUBREDDIT: {
      const { subreddit } = post;
      return `/r/${subreddit}`;
    }

    default: {
      // promoted posts don't have subreddits.....
      // and there permalink format isn't supported by the android app
      // instead of deep linking, we can just send them to the current listing page
      if (post.promoted) {
        const { subredditName } = state.platform.currentPage.urlParams;
        if (subredditName) {
          return `/r/${subredditName}`;
        }
        return '/';
      }


      return post.cleanPermalink;
    }
  }
}

export function getXPromoLink(state, path, linkType, additionalData={}) {
  let payload = {
    ...additionalData,
    utm_source: 'xpromo',
    utm_content: linkType,
    interstitial_type: interstitialType(state),
  };

  if (isPartOfXPromoExperiment(state)) {
    let experimentData = {};

    if (currentExperimentData(state)) {
      const { experiment_name, variant } = currentExperimentData(state);
      experimentData = {
        utm_name: experiment_name,
        utm_term: variant,
      };
    }
    payload = {
      ...payload,
      ...experimentData,
      utm_medium: 'experiment',
    };

  } else {
    payload = { ...payload, utm_medium: 'interstitial' };
  }

  payload = {
    ...payload,
    ...xPromoExtraScreenViewData(state),
  };

  return getBranchLink(state, path, {
    ...payload,
    ...xPromoExtraScreenViewData(state),
  });
}

function getClosingTimeRange(state) {
  const defaultRange = frequency[EVERY_TWO_WEEKS];
  const experimentData = getFrequencyExperimentData(state);
  if (experimentData) {
    return (frequency[experimentData.variant] || defaultRange);
  }
  return defaultRange;
}
 
function getLastClosedLimitUTS(state) {
  const lastClosedStr = localStorage.getItem(BANNER_LAST_CLOSED);
  const lastClosedDate = (lastClosedStr ? new Date(lastClosedStr).getTime() : 0);
  return lastClosedDate + getClosingTimeRange(state);
}

export function getBranchLink(state, path, payload={}) {
  const { user, accounts } = state;

  const { loid, loidCreated } = getLoidValues(accounts);

  let userName;
  let userId;

  const userAccount = user.loggedOut ? null : accounts[user.name];
  if (userAccount) {
    userName = userAccount.name;
    userId = userAccount.id;
  }

  const basePayload = {
    channel: 'mweb_branch',
    feature: 'xpromo',
    campaign: 'xpromo',
    // We can use this space to fill "tags" which will populate on the
    // branch dashboard and allow you sort/parse data. Optional/not required.
    // tags: [ 'tag1', 'tag2' ],
    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    // android deep links expect reddit/ prefixed urls
    '$og_redirect': `${config.reddit}${path}`,
    '$deeplink_path': path,
    '$android_deeplink_path': `reddit${path}`,
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    mweb_user_id36: userId,
    mweb_user_name: userName,
    ...getBasePayload(state),
    ...buildSubredditData(state),
  };


  return url.format({
    protocol: 'https',
    host: 'reddit.app.link',
    pathname: '/',
    query: {...basePayload, ...payload},
  });
}

/**
 * @TODO: These functions should refactored:
 * - shouldNotShowBanner
 * - shouldNotListingClick
 */
export function shouldNotShowBanner(state) {
  // Do not show the banner:
  // If localStorage is not available
  if (!localStorageAvailable()) {
    return 'local_storage_unavailable';
  }
  // Do not show the banner:
  // If closing date is in limit range still
  if (getLastClosedLimitUTS(state) > Date.now()) {
    return 'dismissed_previously';
  }
  // Show the banner
  return false;
}

export function shouldNotListingClick(state) {
  // Every time cohort users don't need to record anything in local storage
  const featureContext = features.withContext({ state });
  if (featureContext.enabled(XPROMO_LISTING_CLICK_EVERY_TIME_COHORT)) {
    return false;
  }

  if (!localStorageAvailable()) {
    return 'local_storage_unavailable';
  }

  // Check if there's been a listing click in the last two weeks
  const lastClickedStr = localStorage.getItem(XPROMO_LAST_LISTING_CLICK_DATE);
  const lastClicked = lastClickedStr ? new Date(lastClickedStr).getTime() : 0;
  if (lastClicked + EVERY_TWO_WEEKS > Date.now()) {
    return 'dismissed_previously';
  }

  return false;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem(BANNER_LAST_CLOSED, new Date());
}

export const markListingClickTimestampLocalStorage = () => {
  if (!localStorageAvailable()) { return; }

  localStorage.setItem(XPROMO_LAST_LISTING_CLICK_DATE, new Date());
};
