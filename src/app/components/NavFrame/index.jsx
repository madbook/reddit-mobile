import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';

const {
  VARIANT_XPROMO_FP_LOGIN_REQUIRED,
  VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED,
  VARIANT_XPROMO_FP_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
} = flagConstants;

function transparentXPromoVariant(state) {
  const featureContext = features.withContext({ state });
  return featureContext.enabled(VARIANT_XPROMO_FP_TRANSPARENT) ||
         featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT);
}

function loginRequiredXPromoVariant(state) {
  const featureContext = features.withContext({ state });
  return featureContext.enabled(VARIANT_XPROMO_FP_LOGIN_REQUIRED) ||
         featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED);
}

const xPromoSelector = createSelector(
  transparentXPromoVariant,
  loginRequiredXPromoVariant,
  (state) => { return state.smartBanner.showBanner; },
  (transparentVariant, loginRequiredVariant, showBanner) => {
    const showXPromo = showBanner && transparentVariant;
    const requireLogin = showXPromo && loginRequiredVariant;
    return {
      showXPromo,
      requireLogin,
    };
  },
);

const NavFrame = props => {
  const {
    children,
    requireLogin,
    showXPromo,
  } = props;

  let belowXPromo = null;
  if (!requireLogin) {
    belowXPromo = (
      <div>
        <TopNav />
        <div className='NavFrame__below-top-nav'>
          <EUCookieNotice />
          { children }
        </div>
      </div>
    );
  }

  return (
    <div className='NavFrame'>
      { showXPromo ?
        <DualPartInterstitial>{ children }</DualPartInterstitial> : null }
      { belowXPromo }
    </div>
  );
};

export default connect(xPromoSelector)(NavFrame);
