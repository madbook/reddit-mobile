/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { TYPES } from 'app/actions/toaster';
import * as toasterActions from 'app/actions/toaster';

const T = React.PropTypes;
const HEIGHT = 80;

function Toaster(props) {
  const interpolateTo = { bottom: spring(0, { stiffness: 400 }), opacity: spring(1) };

  return (
    <Motion defaultStyle={{ bottom: -HEIGHT, opacity: 0 }} style={ interpolateTo }>
      { style =>
        <div className='Toaster' style={{ height: HEIGHT, ...style }}>
          { chooseBody(props) }
        </div>
      }
    </Motion>
  );
}

function chooseBody(props) {
  switch (props.type) {
    case TYPES.ERROR:
      return renderError(props);
    default:
      return null;
  }
}

function renderError(props) {
  return (
    <div className='Toaster__content'>
      <div className='Toaster__icon-box error'><div className='icon icon-moose' /></div>
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
