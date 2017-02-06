import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { getDevice } from 'lib/getDeviceFromState';
import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';
import XPromoWrapper from 'app/components/XPromoWrapper';
import { navigateToAppStore, promoClicked } from 'app/actions/xpromo';


export function DualPartInterstitial(props) {
  return (
    <XPromoWrapper>
      <div className='DualPartInterstitial'>
        <div className='DualPartInterstitial__content'>
          <div className='DualPartInterstitial__common'>
            <DualPartInterstitialHeader { ...props } />
            <DualPartInterstitialFooter { ...props } />
          </div>
        </div>
      </div>
    </XPromoWrapper>
  );
}

export const selector = createSelector(
  getDevice,
  (device) => ({ device }),
);

const mapDispatchToProps = dispatch => ({
  navigator: (url) => (() => {
    dispatch(promoClicked());
    dispatch(navigateToAppStore(url, 'interstitial_button'));
  }),
});

export default connect(selector, mapDispatchToProps)(DualPartInterstitial);
