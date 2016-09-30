import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayActions from 'app/actions/overlay';
import cx from 'lib/classNames';

const T = React.PropTypes;

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

export const OverlayMenu = props => (
  <nav
    className={ cx('OverlayMenu', { 'm-with-top-nav': !props.fullscreen }) }
    onClick={ props.closeOverlayMenu }
  >
    <ul className='OverlayMenu-ul list-unstyled' onClick={ stopClickPropagation }>
      { props.children }
    </ul>
  </nav>
);

OverlayMenu.propTypes = {
  fullscreen: T.bool,
};

const mapDispatchProps = (dispatch) => ({
  closeOverlayMenu: () => dispatch(overlayActions.closeOverlay()),
});

export default connect(null, mapDispatchProps)(OverlayMenu);
