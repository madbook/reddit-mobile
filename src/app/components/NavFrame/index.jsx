import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import {
  shouldShowXPromo,
  loginRequiredEnabled as loginRequiredXPromoVariant,
} from 'app/selectors/xpromo';


const xPromoSelector = createSelector(
  shouldShowXPromo,
  loginRequiredXPromoVariant,
  (state) => { return state.smartBanner.showBanner; },
  (showXPromo, loginRequiredVariant) => {
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
