import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import url from 'url';

import { redirect } from '@r/platform/actions';

import * as xpromoActions from 'app/actions/xpromo';
import { XPROMO_DISMISS } from 'lib/eventUtils';
import getSubreddit from 'lib/getSubredditFromState';
import { getBranchLink } from 'lib/smartBannerState';
import {
  loginRequiredEnabled as requireXPromoLogin,
  isPartOfXPromoExperiment,
  currentExperimentData,
} from 'app/selectors/xpromo';
import { buildAdditionalEventData } from 'app/router/handlers/PostsFromSubreddit';

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
      dispatch(xpromoActions.trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: 'link' }));
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

function createNativeAppLink(state, linkType) {
  let payload = { utm_source: 'xpromo', utm_content: linkType };
  if (isPartOfXPromoExperiment(state)) {
    let experimentData = {};
    if (currentExperimentData(state)) {
      const { experiment_name, variant } = currentExperimentData(state);
      experimentData = {
        utm_name: experiment_name,
        utm_term: variant,
      };
    }
    payload = {
      ...payload,
      ...experimentData,
      utm_medium: 'experiment',
    };
  } else {
    payload = { ...payload, utm_medium: 'interstitial' };
  }

  payload= { ...payload, ...buildAdditionalEventData(state) };

  return getBranchLink(state, payload);
}

const selector = createSelector(
  getSubreddit,
  requireXPromoLogin,
  state => linkType => createNativeAppLink(state, linkType),
  (subredditName, requireLogin, createLink) => {
    const nativeInterstitialLink = createLink('interstitial');
    const nativeLoginLink = createLink('login');
    return { subredditName, requireLogin, nativeInterstitialLink, nativeLoginLink };
  }
);

export default connect(selector)(DualPartInterstitialFooter);
