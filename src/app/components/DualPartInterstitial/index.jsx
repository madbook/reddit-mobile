import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';
import * as smartBannerActions from 'app/actions/smartBanner';

import XPromoWrapper from 'app/components/XPromoWrapper';

import {
  DualPartInterstitialCommon,
  selector,
} from './common';

export function DualPartInterstitial(props) {
  return (
    <XPromoWrapper>
      <div className='DualPartInterstitial'>
        <div className='DualPartInterstitial__content'>
          <DualPartInterstitialCommon { ...props } />
        </div>
      </div>
    </XPromoWrapper>
  );
}

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(smartBannerActions.close()),
  navigator: (url) => (() => {
    markBannerClosed();
    dispatch(redirect(url));
  }),
});

export default connect(selector, mapDispatchToProps)(DualPartInterstitial);
