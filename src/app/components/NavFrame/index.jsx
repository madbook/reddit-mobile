import './styles.less';

import { some } from 'lodash/collection';
import React from 'react';
import { connect } from 'react-redux';

import SmartBanner from 'app/components/SmartBanner';
import InterstitialPromo from 'app/components/InterstitialPromo';
import InterstitialListing from 'app/components/InterstitialListing';
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
} = flagConstants;


export function crossPromoSelector(state) {
  const features = featureFlags.withContext({ state });

  const showBanner = state.smartBanner.showBanner;
  const showInterstitial = showBanner &&
                           some([
                             VARIANT_XPROMO_BASE,
                             VARIANT_XPROMO_LIST,
                             VARIANT_XPROMO_RATING,
                             VARIANT_XPROMO_LISTING,
                           ], variant => features.enabled(variant));
  const showInterstitialListing = showBanner &&
                                  some([
                                    VARIANT_XPROMO_SUBREDDIT,
                                  ], variant => features.enabled(variant));
  const showSmartBanner = !showInterstitial && !showInterstitialListing && showBanner
                       && !features.enabled(VARIANT_XPROMO_CLICK)
                       && features.enabled(SMARTBANNER);

  return {
    showInterstitial,
    showInterstitialListing,
    showSmartBanner,
  };
}


const NavFrame = props => {
  const {
    showInterstitial,
    showInterstitialListing,
    showSmartBanner,
  } = props;

  return (
    <div className='NavFrame'>
      { showInterstitial ? <InterstitialPromo /> : null }
      { showInterstitialListing ? <InterstitialListing /> : null }
      <TopNav />
      <div className='NavFrame__below-top-nav'>
        <EUCookieNotice />
        { props.children }
      </div>
      { showSmartBanner ? <SmartBanner /> : null }
    </div>
  );
};

export default connect(crossPromoSelector)(NavFrame);
