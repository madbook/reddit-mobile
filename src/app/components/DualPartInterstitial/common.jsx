/* eslint-disable react/jsx-curly-spacing */

import React from 'react';
import { createSelector } from 'reselect';

import { getDevice } from 'lib/getDeviceFromState';
import { generateBranchLink } from 'lib/branch';

import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';

const T = React.PropTypes;

export function DualPartInterstitialCommon(props) {
  return (
    <div className='DualPartInterstitial__common'>
      <DualPartInterstitialHeader { ...props } />
      <DualPartInterstitialFooter { ...props }/>
    </div>
  );
}

DualPartInterstitialCommon.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

function getUrls(state) {
  return [
    generateBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_1',
    }),
    generateBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_2',
    }),
  ];
}

export const selector = createSelector(
  getUrls,
  getDevice,
  (urls, device) => {
    return { urls, device };
  }
);
