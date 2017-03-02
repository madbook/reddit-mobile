import { find, some } from 'lodash';

import { flags as flagConstants, themes, xpromoDisplayTheme } from 'app/constants';
import features, { isNSFWPage } from 'app/featureFlags';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { getExperimentData } from 'lib/experiments';
import { getDevice, IPHONE, ANDROID } from 'lib/getDeviceFromState';

const { DAYMODE } = themes;
const { USUAL, MINIMAL } = xpromoDisplayTheme;

const {
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID,
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

const EXPERIMENT_NAMES = {
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS]: 'mweb_xpromo_interstitial_comments_ios',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID]: 'mweb_xpromo_interstitial_comments_android',
};

export function getRouteActionName(state) {
  const routeMeta = getRouteMetaFromState(state);
  const actionName = routeMeta && routeMeta.name;
  return actionName;
}

function isDayMode(state) {
  return DAYMODE === state.theme;
}

function activeXPromoExperimentName(state) {
  const featureContext = features.withContext({ state });
  const featureFlag = find(EXPERIMENT_FULL, feature => {
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
  if (loginRequiredEnabled(state)) {
    return 'require_login';
  } else if (xpromoThemeIsUsual(state)) {
    return 'transparent';
  }
  return 'black_banner_fixed_bottom';
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
