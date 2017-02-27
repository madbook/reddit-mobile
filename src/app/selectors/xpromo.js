import { find, some } from 'lodash';

import {
  flags as flagConstants,
  themes,
  xpromoDisplayTheme,
  XPROMO_LISTING_CLICK_EVENTS_NAME,
} from 'app/constants';

import features, { isNSFWPage } from 'app/featureFlags';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { getExperimentData } from 'lib/experiments';
import { getDevice, IPHONE, ANDROID } from 'lib/getDeviceFromState';

import { shouldNotListingClick } from 'lib/smartBannerState';
import { trackXPromoIneligibleEvent } from 'lib/eventUtils';

const { DAYMODE } = themes;
const { USUAL, MINIMAL } = xpromoDisplayTheme;

const {
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID,
  XPROMO_LISTING_CLICK_EVERY_TIME_COHORT,
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_IOS_ENABLED,
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_ANDROID_ENABLED,
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_IOS_ENABLED,
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_ANDROID_ENABLED,
} = flagConstants;

const EXPERIMENT_FULL = [
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,
];

const LOGIN_REQUIRED_FLAGS = [
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
];

const COMMENTS_PAGE_BANNER_FLAGS = [
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID,
];

const TWO_WEEK_LISTING_CLICK_FLAGS = [
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_IOS_ENABLED,
  VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_ANDROID_ENABLED,
];

const EVERY_TIME_LISTING_CLICK_FLAGS = [
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_IOS_ENABLED,
  VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_ANDROID_ENABLED,
];

const EXPERIMENT_NAMES = {
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS]: 'mweb_xpromo_interstitial_comments_ios',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID]: 'mweb_xpromo_interstitial_comments_android',
  [VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_IOS_ENABLED]: 'mweb_xpromo_two_week_listing_click_ios',
  [VARIANT_XPROMO_LISTING_CLICK_TWO_WEEK_ANDROID_ENABLED]: 'mweb_xpromo_two_week_listing_click_android',
  [VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_IOS_ENABLED]: 'mweb_xpromo_every_time_listing_click_ios',
  [VARIANT_XPROMO_LISTING_CLICK_EVERY_TIME_ANDROID_ENABLED]: 'mweb_xpromo_every_time_listing_click_android',
};

export function getRouteActionName(state) {
  const routeMeta = getRouteMetaFromState(state);
  const actionName = routeMeta && routeMeta.name;
  return actionName;
}

function isDayMode(state) {
  return DAYMODE === state.theme;
}

function activeXPromoExperimentName(state, flags=EXPERIMENT_FULL) {
  const featureContext = features.withContext({ state });
  const featureFlag = find(flags, feature => {
    return featureContext.enabled(feature);
  });
  return featureFlag ? EXPERIMENT_NAMES[featureFlag] : null;
}

export function xpromoTheme(state) {
  switch (getRouteActionName(state)) {
    case 'comments':
      return MINIMAL;
    default: 
      return USUAL;
  }
}

export function xpromoThemeIsUsual(state) {
  return xpromoTheme(state) === USUAL;
}

export function xpromoIsConfiguredOnPage(state) {
  const actionName = getRouteActionName(state);
  if (actionName === 'index' || actionName === 'listing') {
    return true;
  } else if (actionName === 'comments') {
    return commentsInterstitialEnabled(state);
  }

  return false;
}

// @TODO: this should be controlled
// by FeatureFlags.js config only
export function xpromoIsEnabledOnPage(state) {
  return isEligibleListingPage(state) || isEligibleCommentsPage(state);
}

export function isEligibleListingPage(state) {
  const actionName = getRouteActionName(state);
  return actionName === 'index'
    || (actionName === 'listing' && !isNSFWPage(state));
}

export function isEligibleCommentsPage(state) {
  const actionName = getRouteActionName(state);
  return actionName === 'comments' && isDayMode(state) && !isNSFWPage(state);
}

export function xpromoIsEnabledOnDevice(state) {
  const device = getDevice(state);
  // If we don't know what device we're on, then
  // we should not match any list
  // of allowed devices.
  return (!!device) && [ANDROID, IPHONE].includes(device);
}

function anyFlagEnabled(state, flags) {
  const featureContext = features.withContext({ state });
  return some(flags, feature => {
    return featureContext.enabled(feature);
  });
}

export function loginRequiredEnabled(state) {
  if (!(shouldShowXPromo(state) && state.user.loggedOut)) {
    return false;
  }
  return anyFlagEnabled(state, LOGIN_REQUIRED_FLAGS);
}

export function commentsInterstitialEnabled(state) {
  if (!shouldShowXPromo(state)) {
    return false;
  }

  return anyFlagEnabled(state, COMMENTS_PAGE_BANNER_FLAGS);
}

/**
 * @param {object} state - redux state
 * @param {string} postId - id of the post that was clicked on
 * @return {boolean} is this listing click eligible to be intercepted,
 * and redirected to the app store page for the reddit app
 */
export function listingClickEnabled(state, postId) {
  if (!isEligibleListingPage(state) || !xpromoIsEnabledOnDevice(state)) {
    return false;
  }

  if (!state.user.loggedOut) {
    const userAccount = state.accounts[state.user.name];
    if (userAccount && userAccount.isMod) {
      return false;
    }
  }

  const everyTime = features.withContext({ state }).enabled(XPROMO_LISTING_CLICK_EVERY_TIME_COHORT);
  const eventData = {
    interstitial_type: XPROMO_LISTING_CLICK_EVENTS_NAME,
    every_time: everyTime,
  };

  if (!state.smartBanner.canListingClick) {
    trackXPromoIneligibleEvent(state, eventData, shouldNotListingClick());
    return false;
  }

  const post = state.posts[postId];
  if (post.promoted) {
    trackXPromoIneligibleEvent(state, eventData, 'promoted_post');
    return false;
  }

  if (everyTime) {
    return anyFlagEnabled(state, EVERY_TIME_LISTING_CLICK_FLAGS);
  }

  return anyFlagEnabled(state, TWO_WEEK_LISTING_CLICK_FLAGS);
}


/**
 * This should only be called when we know the user is eligible and buckted
 * for a listing click experiment group. Used to let `getXPromoExperimentPayload`
 * properly attribute experiment data
 */
export function listingClickExperimentData(state) {
  let experimentName = null;

  if (features.withContext({ state }).enabled(XPROMO_LISTING_CLICK_EVERY_TIME_COHORT)) {
    experimentName = activeXPromoExperimentName(state, EVERY_TIME_LISTING_CLICK_FLAGS);
  } else {
    experimentName = activeXPromoExperimentName(state, TWO_WEEK_LISTING_CLICK_FLAGS);
  }

  if (experimentName) {
    return getExperimentData(state, experimentName);
  }
}

export function scrollPastState(state) {
  return state.smartBanner.scrolledPast;
}

export function scrollStartState(state) {
  return state.smartBanner.scrolledStart;
}

export function shouldShowXPromo(state) {
  return state.smartBanner.showBanner &&
    xpromoIsEnabledOnPage(state) &&
    xpromoIsEnabledOnDevice(state);
}

export function interstitialType(state) {
  if (isEligibleListingPage(state)) {
    if (state.smartBanner.showingListingClickInterstitial) {
      return XPROMO_LISTING_CLICK_EVENTS_NAME;
    }

    if (loginRequiredEnabled(state)) {
      return 'require_login';
    }

    return 'transparent';
  } else if (isEligibleCommentsPage(state)) {
    return 'black_banner_fixed_bottom';
  }
}

export function isPartOfXPromoExperiment(state) {
  return shouldShowXPromo(state) && !!activeXPromoExperimentName(state);
}

export function currentExperimentData(state) {
  const experimentName = activeXPromoExperimentName(state);
  return getExperimentData(state, experimentName);
}

export function XPromoIsActive(state) {
  return shouldShowXPromo(state) && xpromoIsConfiguredOnPage(state);
}
