import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';
import * as smartBannerActions from 'app/actions/smartBanner';
import * as modalActions from 'app/actions/modal';
import XPromoWrapper from 'app/components/XPromoWrapper';

import {
  InterstitialListingCommon,
  selector,
} from './common';

export function InterstitialModal(props) {
  return (
    <XPromoWrapper>
      <div className='InterstitialListing'>
        <div className='InterstitialListing__modalCover' />
        <div className='InterstitialListing__modal'>
          <div className='InterstitialListing__modalcontent'>
            <InterstitialListingCommon { ... props } />
          </div>
        </div>
      </div>
    </XPromoWrapper>
  );
}
  
const mapDispatchToProps = dispatch => ({
  onClose: () => {
    dispatch(modalActions.closeModal());
    dispatch(smartBannerActions.close());
  },
  navigator: (url) => (() => {
    markBannerClosed();
    dispatch(redirect(url));
  }),
});

export default connect(selector, mapDispatchToProps)(InterstitialModal);
