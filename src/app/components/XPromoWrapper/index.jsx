import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import * as xpromoActions from 'app/actions/xpromo';
import { XPROMO_SCROLLPAST } from 'lib/eventUtils';

const T = React.PropTypes;

class XPromoWrapper extends React.Component {
  static propTypes = {
    recordXPromoShown: T.func.isRequired,
  };

  onScroll = () => {
    // For now we will consider scrolling half the viewport
    // "scrolling past" the interstitial.
    // note the referencing of window
    const { dispatch, alreadyScrolledPast } = this.props;
    if (alreadyScrolledPast) {
      window.removeEventListener('scroll', this.onScroll);
    } else if (window.pageYOffset > window.innerHeight / 2) {
      dispatch(xpromoActions.trackXPromoEvent(XPROMO_SCROLLPAST));
      dispatch(xpromoActions.promoScrollPast());
    }
  }

  componentDidMount() {
    // Indicate that we've displayed a crosspromotional UI, so we don't keep
    // showing them during this browsing session.
    this.props.recordXPromoShown();
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    return this.props.children;
  }
}

const selector = createStructuredSelector({
  currentUrl: state => state.platform.currentPage.url,
  alreadyScrolledPast: state => state.smartBanner.scrolledPast,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  recordXPromoShown: () =>
    dispatchProps.dispatch(xpromoActions.recordShown(stateProps.currentUrl)),
  ...ownProps,
});

export default connect(selector, undefined, mergeProps)(XPromoWrapper);
