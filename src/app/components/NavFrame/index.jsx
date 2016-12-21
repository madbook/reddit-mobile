import { some } from 'lodash/collection';
import React from 'react';
import { connect } from 'react-redux';

import SmartBanner from 'app/components/SmartBanner';
import InterstitialPromo from 'app/components/InterstitialPromo';
import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import { flags as flagConstants } from 'app/constants';
import featureFlags from 'app/featureFlags';

const {
  SMARTBANNER,
  VARIANT_XPROMO_BASE,
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_RATING,
  VARIANT_XPROMO_LISTING,
  VARIANT_XPROMO_SUBREDDIT,
  VARIANT_XPROMO_CLICK,
  VARIANT_XPROMO_FP_GIF,
  VARIANT_XPROMO_FP_STATIC,
  VARIANT_XPROMO_FP_SPEED,
  VARIANT_XPROMO_FP_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP,
  VARIANT_XPROMO_SUBREDDIT_LISTING,
} = flagConstants;


export function crossPromoSelector(state) {
  const features = featureFlags.withContext({ state });

  const showBanner = state.smartBanner.showBanner;
  const showDualPartInterstitial = showBanner &&
                                  some([
                                    VARIANT_XPROMO_SUBREDDIT,
                                    VARIANT_XPROMO_FP_GIF,
                                    VARIANT_XPROMO_FP_STATIC,
                                    VARIANT_XPROMO_FP_SPEED,
                                    VARIANT_XPROMO_FP_TRANSPARENT,
                                    VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
                                    VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP,
                                    VARIANT_XPROMO_SUBREDDIT_LISTING,
                                  ], variant => features.enabled(variant));
  const showInterstitial = showBanner && !showDualPartInterstitial &&
                           some([
                             VARIANT_XPROMO_BASE,
                             VARIANT_XPROMO_LIST,
                             VARIANT_XPROMO_RATING,
                             VARIANT_XPROMO_LISTING,
                           ], variant => features.enabled(variant));
  const showSmartBanner = !showInterstitial && !showDualPartInterstitial && showBanner
                       && !features.enabled(VARIANT_XPROMO_CLICK)
                       && features.enabled(SMARTBANNER);

  return {
    showInterstitial,
    showDualPartInterstitial,
    showSmartBanner,
  };
}


const NavFrame = props => {
  const {
    children,
    showInterstitial,
    showDualPartInterstitial,
    showSmartBanner,
  } = props;

  return (
    <div className='NavFrame'>
      { showInterstitial ? <InterstitialPromo /> : null }
      { showDualPartInterstitial ?
        <DualPartInterstitial>{ children }</DualPartInterstitial> : null }
      <TopNav />
      <div className='NavFrame__below-top-nav'>
        <EUCookieNotice />
        { children }
      </div>
      { showSmartBanner ? <SmartBanner /> : null }
    </div>
  );
};

export default connect(crossPromoSelector)(NavFrame);
