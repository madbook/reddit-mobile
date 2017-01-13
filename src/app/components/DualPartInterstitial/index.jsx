import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { redirect } from '@r/platform/actions';

import { getDevice } from 'lib/getDeviceFromState';
import { getBranchLink, markBannerClosed } from 'lib/smartBannerState';
import * as xpromoActions from 'app/actions/xpromo';
import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';
import XPromoWrapper from 'app/components/XPromoWrapper';

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

function createNativeAppLink(state) {
  return getBranchLink(state, {
    feature: 'interstitial',
    campaign: 'xpromo_interstitial_listing',
    utm_medium: 'interstitial',
    utm_name: 'xpromo_interstitial_listing',
    utm_content: 'element_1',
  });
}

export const selector = createSelector(
  createNativeAppLink,
  getDevice,
  (nativeAppLink, device) => {
    return { nativeAppLink, device };
  }
);

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(xpromoActions.close()),
  navigator: (url) => (() => {
    markBannerClosed();
    dispatch(redirect(url));
  }),
});

export default connect(selector, mapDispatchToProps)(DualPartInterstitial);
