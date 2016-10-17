import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import config from 'config';

import AdblockTester from 'app/components/AdblockTester';
import GoogleTagManager from 'app/components/GoogleTagManager';

// This component renders things that are needed for ads tracking.
// Right now this is:
// * GoogleTagManager -- used for tracking screenviews for ad targetting
// * AdblockTester -- used to determine if adblock is enabled, this info is
//    included on the base events payload
export const AdsTracking = props => {
  const { subredditName } = props;
  const { mediaDomain, googleTagManagerId } = config;

  return (
    <div>
      { !!googleTagManagerId &&
          <GoogleTagManager
            key='gtm'
            mediaDomain={ mediaDomain }
            googleTagManagerId={ googleTagManagerId }
            subredditName={ subredditName }
          />
      }
      <AdblockTester />
    </div>
  );
};

const selector = createSelector(
  state => state.platform.currentPage.urlParams.subredditName,
  subredditName => ({ subredditName }),
);

export default connect(selector)(AdsTracking);
