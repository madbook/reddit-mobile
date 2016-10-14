/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';

const T = React.PropTypes;

// String constants
const TITLE = 'Reddit';
const SUBTITLE = 'Get the official mobile app';
const CTA = 'GET THE APP';

// Display helpers
const NOOP = () => {};
const HEIGHT = 80;
const STIFFNESS = { stiffness: 400 };

class SmartBanner extends React.Component {
  state = { isShowing: true };

  onClick = () => {
    this.setState({ isShowing: false });
  };

  render() {
    const { url, onClose } = this.props;
    const { isShowing } = this.state;

    const startStyles = isShowing
      ? { bottom: -HEIGHT, opacity: 0 }
      : { bottom: 0, opacity: 1 };

    const finishStyles = isShowing
      ? { bottom: spring(0, STIFFNESS), opacity: spring(1) }
      : { bottom: spring(-HEIGHT, STIFFNESS), opacity: spring(0) };

    // If not showing, trigger an unmount as the final step of the animation
    const onRest = isShowing ? NOOP : onClose;

    return (
      <Motion defaultStyle={ startStyles } style={ finishStyles } onRest={ onRest }>
        { style =>
          <div className='SmartBanner' style={{ height: HEIGHT, ...style }}>
            <div className='SmartBanner__left'>
              <div
                className='SmartBanner__close icon icon-x'
                onClick={ this.onClick }
              />
              <div className='SmartBanner__icon'>
                <SnooIcon />
              </div>
              <div className='SmartBanner__header'>
                <div className='SmartBanner__title'>{ TITLE }</div>
                <div className='SmartBanner__subtitle'>{ SUBTITLE }</div>
              </div>
            </div>
            <div className='SmartBanner__right'>
              <a className='SmartBanner__button' href={ url }>{ CTA }</a>
            </div>
          </div>
        }
      </Motion>
    );
  }
}

SmartBanner.propTypes = {
  url: T.string.isRequired,
  onClose: T.func,
};

const selector = createSelector(
  state => state.smartBanner.clickUrl,
  url => ({ url })
);

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(smartBannerActions.close()),
});

export default connect(selector, mapDispatchToProps)(SmartBanner);
