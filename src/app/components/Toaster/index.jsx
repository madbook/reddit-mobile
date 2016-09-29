/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { TYPES } from 'app/actions/toaster';
import * as toasterActions from 'app/actions/toaster';

const T = React.PropTypes;

const NOOP = () => {};
const HEIGHT = 80;
const CLOSE_TIMER = 3000;
const STIFFNESS = { stiffness: 400 };

class Toaster extends React.Component {
  state = { isShowing: true };

  componentDidMount() {
    setTimeout(() => this.setState({ isShowing: false }), CLOSE_TIMER);
  }

  render() {
    const { isShowing } = this.state;

    const startStyles = isShowing
      ? { bottom: -HEIGHT, opacity: 0 }
      : { bottom: 0, opacity: 1 };

    const finishStyles = isShowing
      ? { bottom: spring(0, STIFFNESS), opacity: spring(1) }
      : { bottom: spring(-HEIGHT, STIFFNESS), opacity: spring(0) };

    // If not showing, trigger an unmount as the final step of the animation
    const onRest = isShowing ? NOOP : this.props.onClose;

    return (
      <Motion defaultStyle={ startStyles } style={ finishStyles } onRest={ onRest }>
        { style =>
          <div className='Toaster' style={{ height: HEIGHT, ...style }}>
            { chooseBody(this.props) }
          </div>
        }
      </Motion>
    );
  }
}

function chooseBody(props) {
  switch (props.type) {
    case TYPES.ERROR:
      return renderDefaultBody(props, 'error', 'moose');
    case TYPES.SUCCESS:
      return renderDefaultBody(props, 'success', 'snoo');
    default:
      return null;
  }
}

function renderDefaultBody(props, modifier, icon) {
  return (
    <div className='Toaster__content'>
      <div className={ `Toaster__icon-box ${modifier}` }>
        <div className={ `icon icon-${icon}` } />
      </div>
      <div className='Toaster__message'>{ props.message }</div>
      <div className='Toaster__close icon icon-nav-close' onClick={ props.onClose } />
    </div>
  );
}

Toaster.propTypes = {
  message: T.string.isRequired,
  type: T.string.isRequired,
  isOpen: T.bool.isRequired,
  onClose: T.func.isRequired,
};

const selector = createSelector(
  state => state.toaster,
  toaster => ({ ...toaster }),
);

const dispatcher = dispatch => ({
  onClose: () => dispatch(toasterActions.closeToaster()),
});

const mergeProps = (stateProps, dispatchProps) => {
  return {
    ...stateProps,
    onClose: () => {
      if (stateProps.isOpen) {
        dispatchProps.onClose();
      }
    },
  };
};

export default connect(selector, dispatcher, mergeProps)(Toaster);
