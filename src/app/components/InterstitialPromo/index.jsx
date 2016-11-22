/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';

import { flags } from 'app/constants';
import featureFlags from 'app/featureFlags';
import { getDevice } from 'lib/getDeviceFromState';
import { getBranchLink } from 'lib/smartBannerState';

import { featuresSelector} from 'app/selectors/features';
import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';
import Logo from '../Logo';

const T = React.PropTypes;

const {
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_RATING,
  VARIANT_XPROMO_LISTING,
} = flags;

// String constants
const TITLE = 'Just a tap away';
const CTA = 'Tap to get Reddit';


function List() {
  return (
    <div className='InterstitialPromo__bulletlist'>
      <ul>
        <li><span>50% Faster</span></li>
        <li><span>Infinite Scroll</span></li>
        <li><span>Realtime Updates</span></li>
      </ul>
    </div>
  );
}

function Rating(props) {
  const { device, navigate } = props;

  return (
    <div onClick={ navigate }>
      <div className='InterstitialPromo__rating'>
        <div className='InterstitialPromo__rating_icon'>
          <SnooIcon />
        </div>
        <div className='InterstitialPromo__rating_right'>
          <div className='InterstitialPromo__rating_title'>
            Reddit for { device }
          </div>
          <div className='InterstitialPromo__rating_stars'>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
          </div>
          <div className='InterstitialPromo__rating_text'>
            5,000+ 5-star reviews
          </div>
        </div>
      </div>
    </div>
  );
}

function InterstitialPromo(props) {
  const { urls, onClose, features, device, navigator } = props;
  const listVariants = features.enabled(VARIANT_XPROMO_LIST) ||
                       features.enabled(VARIANT_XPROMO_LISTING);

  return (
    <div className='InterstitialPromo'>
      <div
        className='InterstitialPromo__close icon icon-x'
        onClick={ onClose }
      />
      <div className='InterstitialPromo__icon'>
        <SnooIcon />
        <div className='InterstitialPromo__wordmark'>
          <Logo />
        </div>
      </div>
      <div className='InterstitialPromo__bottom'>
        <div className='InterstitialPromo__header'>
          <div className='InterstitialPromo__title'>{ TITLE }</div>
          <div className='InterstitialPromo__subtitle'>
            Reddit is better with the app.
            We&nbsp;hate to intrude, but&nbsp;you&nbsp;deserve&nbsp;the&nbsp;best.
          </div>
          { listVariants ? <List /> : null }
        </div>
        <div
          className='InterstitialPromo__button'
          onClick={ navigator(urls[0]) }
        >
          { CTA }
          <span className="icon icon-play"></span>
        </div>
        { features.enabled(VARIANT_XPROMO_RATING) ?
            <Rating device={ device} navigate={ navigator(urls[1]) }/> : null }
        <div className='InterstitialPromo__dismissal'>
          or go to the <a onClick={ onClose }>mobile site</a>
        </div>
      </div>
    </div>
  );
}

InterstitialPromo.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

function getUrls(state) {
  const features = featureFlags.withContext({ state });
  const campaign = features.enabled(VARIANT_XPROMO_LISTING)
    ? 'xpromo_interstitial_listing'
    : 'xpromo_interstitial';

  return [
    getBranchLink(state, {
      feature: 'interstitial',
      campaign,
      utm_medium: 'interstitial',
      utm_name: campaign,
      utm_content: 'element_1',
    }),
    getBranchLink(state, {
      feature: 'interstitial',
      campaign,
      utm_medium: 'interstitial',
      utm_name: campaign,
      utm_content: 'element_2',
    }),
  ];
}

const selector = createStructuredSelector({
  urls: getUrls,
  features: featuresSelector,
  device: getDevice,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(smartBannerActions.close()),
  navigator: (url) => (() => {
    markBannerClosed();
    dispatch(redirect(url));
  }),
});

export default connect(selector, mapDispatchToProps)(InterstitialPromo);
