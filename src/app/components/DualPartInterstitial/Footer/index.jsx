import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import url from 'url';

import { redirect } from 'platform/actions';
import * as xpromoActions from 'app/actions/xpromo';
import { XPROMO_DISMISS } from 'lib/eventUtils';
import getSubreddit from 'lib/getSubredditFromState';
import { getXPromoLinkforCurrentPage } from 'lib/smartBannerState';
import {
  loginRequiredEnabled as requireXPromoLogin,
} from 'app/selectors/xpromo';

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
            onClick={ navigator(nativeInterstitialLink) }
          >
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

const selector = createStructuredSelector({
  subredditName: getSubreddit,
  requireLogin: requireXPromoLogin,
  nativeInterstitialLink: state => getXPromoLinkforCurrentPage(state, 'interstitial'),
  nativeLoginLink: state => getXPromoLinkforCurrentPage(state, 'login'),
});

export default connect(selector)(DualPartInterstitialFooter);
