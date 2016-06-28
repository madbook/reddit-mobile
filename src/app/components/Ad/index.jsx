import React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import throttle from 'lodash/throttle';

import * as adActions from 'app/actions/ads';
import { TOP_NAV_HEIGHT } from 'app/constants';
import Post from 'app/components/Post';

class Ad extends React.Component {
  constructor(props) {
    super(props);

    this.scrollListener = throttle(() => this.checkImpression(), 100);
  }

  componentDidMount() {
    if (!this.props.adTracked) {
      window.addEventListener('scroll', this.scrollListener);
      this.checkImpression(); // check manually in case the ad is visible on the first render
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollListener);
  }

  checkImpression() {
    const node = findDOMNode(this);
    const winHeight = window.innerHeight;
    const rect = node.getBoundingClientRect();
    const top = rect.top;
    const height = rect.height;
    const bottom = top + rect.height;
    const middle = (top + bottom) / 2;
    const middleIsAboveBottom = middle < winHeight;
    const middleIsBelowTop = bottom > TOP_NAV_HEIGHT + height / 2;

    if (middleIsAboveBottom && middleIsBelowTop) {
      window.removeEventListener('scroll', this.scrollListener);
      this.props.onAdMadeImpression();
    }
  }

  render() {
    return <Post { ...this.props.postProps } />;
  }
}

const selector = createSelector(
  (state, props) => state.adRequests[props.adId],
  adRequest => ({ adTracked: adRequest.impressionTracked }),
);

const mapDispatchToProps = (dispatch, { adId }) => ({
  onAdMadeImpression() { dispatch(adActions.track(adId)); },
});

export default connect(selector, mapDispatchToProps)(Ad);
