import React from 'react';
import { connect } from 'react-redux';

import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';

export function xPromoSelector(state) {
  const showDualPartInterstitial = state.smartBanner.showBanner;
  return {
    showDualPartInterstitial,
  };
}

const NavFrame = props => {
  const {
    children,
    showDualPartInterstitial,
  } = props;

  return (
    <div className='NavFrame'>
      { showDualPartInterstitial ?
        <DualPartInterstitial>{ children }</DualPartInterstitial> : null }
      <TopNav />
      <div className='NavFrame__below-top-nav'>
        <EUCookieNotice />
        { children }
      </div>
    </div>
  );
};

export default connect(xPromoSelector)(NavFrame);
