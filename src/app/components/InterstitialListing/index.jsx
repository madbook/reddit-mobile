import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';
import * as smartBannerActions from 'app/actions/smartBanner';

import {
  InterstitialListingCommon,
  selector,
} from './common';

export function InterstitialListing(props) {
  return (
    <div className='InterstitialListing'>
      <div className='InterstitialListing__content'>
        <InterstitialListingCommon { ... props } />
      </div>
    </div>
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
