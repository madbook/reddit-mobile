import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import url from 'url';

import { redirect } from '@r/platform/actions';

import * as xpromoActions from 'app/actions/xpromo';
import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';
import getSubreddit from 'lib/getSubredditFromState';
import { getBranchLink } from 'lib/smartBannerState';

const {
  VARIANT_XPROMO_FP_LOGIN_REQUIRED,
  VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED,
  VARIANT_XPROMO_FP_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
} = flagConstants;

const List = () => {
  return (
    <div className='DualPartInterstitialFooter__bulletList'>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-controversial' />
        50% Faster
      </div>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-compact' />
        Infinite Scroll
      </div>
      <div className='DualPartInterstitialFooter__bulletItem'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-play_triangle' />
        Autoplay GIFs
      </div>
    </div>
  );
};

class DualPartInterstitialFooter extends React.Component {

  componentDidMount() {
    const { dispatch, requireLogin } = this.props;
    if (requireLogin) {
      dispatch(xpromoActions.loginRequired());
    }
  }

  onClose = () => {
    const { dispatch, requireLogin } = this.props;
    if (requireLogin) {
      dispatch(redirect(this.loginLink()));
    } else {
      dispatch(xpromoActions.close());
    }
  }

  loginLink() {
    // note that we create and pass in the login link from the interstitial
    // because creating branch links require window. Since login is sometimes
    // rendered from the server, we have to do this here.
    const { nativeLoginLink } = this.props;
    return url.format({
      pathname: '/login',
      query: { 'native_app_promo': 'true', 'native_app_link': nativeLoginLink },
    });
  }

  render() {
    const {
      subredditName,
      nativeInterstitialLink,
      navigator,
      requireLogin,
    } = this.props;

    let dismissal;

    if (requireLogin) {
      dismissal = (
        <span className='DualPartInterstitialFooter__dismissalText'>
          or <a className='DualPartInterstitialFooter__dismissalLink' onClick={ this.onClose } >login</a> to the mobile site
        </span>
      );
    } else {
      dismissal = (
        <span className='DualPartInterstitialFooter__dismissalText'>
          or go to the <a className='DualPartInterstitialFooter__dismissalLink' onClick={ this.onClose } >mobile site</a>
        </span>
      );
    }

    const pageName = subredditName ? `r/${ subredditName }` : 'Reddit';
    const subtitleText = `View ${ pageName } in the app because you deserve the best.`;

    return (
      <div className='DualPartInterstitialFooter'>
        <div className='DualPartInterstitialFooter__content'>
          <div className='DualPartInterstitialFooter__subtitle'>
            { subtitleText }
          </div>
          <List />
          <div className='DualPartInterstitialFooter__button'
               onClick={ navigator(nativeInterstitialLink) }>
            Continue
          </div>
          <div className='DualPartInterstitialFooter__dismissal'>
            { dismissal }
          </div>
        </div>
      </div>
    );
  }
}

function createNativeAppLink(state, campaign, medium) {
  return getBranchLink(state, {
    feature: 'interstitial',
    campaign,
    utm_name: campaign,
    utm_medium: medium,
  });
}

const selector = createSelector(
  getSubreddit,
  (state) => { return features.withContext({ state }); },
  (state) => { return state.user.loggedOut; },
  (state) => {
    return (campaign, medium) => {
      return createNativeAppLink(state, campaign, medium);
    };
  },
  (subredditName, featureContext, loggedOut, createLink) => {
    const requireLogin = (
      loggedOut &&
      (featureContext.enabled(VARIANT_XPROMO_FP_LOGIN_REQUIRED) ||
       featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED))
    );
    let campaign;
    if (featureContext.enabled(VARIANT_XPROMO_FP_LOGIN_REQUIRED)) {
      campaign = 'xpromo_fp_login_required';
    } else if (featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED)) {
      campaign = 'xpromo_subreddit_login_required';
    } else if (featureContext.enabled(VARIANT_XPROMO_FP_TRANSPARENT)) {
      campaign = 'xpromo_fp_transparent';
    } else if (featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT)) {
      campaign = 'xpromo_subreddit_transparent';
    }
    const nativeInterstitialLink = createLink(campaign, 'interstitial');
    const nativeLoginLink = createLink(campaign, 'login');
    return { subredditName, requireLogin, nativeInterstitialLink, nativeLoginLink };
  }
);

export default connect(selector)(DualPartInterstitialFooter);
