import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';
import * as smartBannerActions from 'app/actions/smartBanner';

import XPromoWrapper from 'app/components/XPromoWrapper';

import {
  InterstitialListingCommon,
  selector,
} from './common';

export function InterstitialListing(props) {
  return (
    <XPromoWrapper>
      <div className='InterstitialListing'>
        <div className='InterstitialListing__content'>
          <InterstitialListingCommon { ... props } />
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

export default connect(selector, mapDispatchToProps)(InterstitialListing);
