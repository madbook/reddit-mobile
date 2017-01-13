import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import * as xpromoActions from 'app/actions/xpromo';


const T = React.PropTypes;

class XPromoWrapper extends React.Component {
  static propTypes = {
    recordXPromoShown: T.func.isRequired,
  };

  componentDidMount() {
    // Indicate that we've displayed a crosspromotional UI, so we don't keep
    // showing them during this browsing session.
    this.props.recordXPromoShown();
  }

  render() {
    return this.props.children;
  }
}

const selector = createStructuredSelector({
  currentUrl: state => state.platform.currentPage.url,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  recordXPromoShown: () =>
    dispatchProps.dispatch(xpromoActions.recordShown(stateProps.currentUrl)),
  ...ownProps,
});

export default connect(selector, undefined, mergeProps)(XPromoWrapper);
