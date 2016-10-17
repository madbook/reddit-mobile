import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayActions from 'app/actions/overlay';
import cx from 'lib/classNames';

const T = React.PropTypes;

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

export const OverlayMenu = props => {
  return (
    <nav
      className={ cx('OverlayMenu', { 'm-with-top-nav': !props.fullscreen }) }
      onClick={ props.onCloseOverlay }
    >
      <ul className='OverlayMenu-ul list-unstyled' onClick={ stopClickPropagation }>
        { props.children }
      </ul>
    </nav>
  );
};

OverlayMenu.propTypes = {
  onCloseOverlay: T.func.isRequired,
  fullscreen: T.bool,
};

const mapDispatchProps = (dispatch, { onCloseOverlay }) => ({
  // We need to fire a different action in order to track search bar closes.
  // This is passed in from outside props.
  onCloseOverlay: () => onCloseOverlay
    ? onCloseOverlay() : dispatch(overlayActions.closeOverlay()),
});

export default connect(null, mapDispatchProps)(OverlayMenu);
