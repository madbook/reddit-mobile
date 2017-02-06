import { find, some } from 'lodash';

import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';
import { getExperimentData } from 'lib/experiments';

const {
  VARIANT_XPROMO_FP_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL,
} = flagConstants;

const EXPERIMENT_NAMES = {
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS]: 'mweb_xpromo_require_login_fp_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID]: 'mweb_xpromo_require_login_fp_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS]: 'mweb_xpromo_require_login_listing_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID]: 'mweb_xpromo_require_login_listing_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL]: 'mweb_xpromo_require_login_fp_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL]: 'mweb_xpromo_require_login_fp_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL]: 'mweb_xpromo_require_login_listing_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL]: 'mweb_xpromo_require_login_listing_android',
};

export function transparentXPromoEnabled(state) {
  const featureContext = features.withContext({ state });
  return featureContext.enabled(VARIANT_XPROMO_FP_TRANSPARENT) ||
    featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT);
}

export function loginRequiredEnabled(state) {
  const featureContext = features.withContext({ state });
  return some([
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
  ], feature => featureContext.enabled(feature));
}

export function shouldShowXPromo(state) {
  return state.smartBanner.showBanner && transparentXPromoEnabled(state);
}

function loginExperimentName(state) {
  const featureContext = features.withContext({ state });
  const featureFlag = find([
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL,
  ], feature => featureContext.enabled(feature));
  return featureFlag ? EXPERIMENT_NAMES[featureFlag] : null;
}

export function interstitialType(state) {
  if (loginRequiredEnabled(state)) {
    return 'require_login';
  }
  return 'transparent';
}

export function isPartOfXPromoExperiment(state) {
  return !!loginExperimentName(state);
}

export function currentExperimentData(state) {
  const experimentName = loginExperimentName(state);
  return getExperimentData(state, experimentName);
}
