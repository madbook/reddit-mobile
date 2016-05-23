import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayMenuActions from 'app/actions/overlayMenu';

import {
  OVERLAY_MENU_CSS_CLASS,
  OVERLAY_MENU_CSS_TOP_NAV_MODIFIER,
} from 'app/constants';

const T = React.PropTypes;

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

const overlayClassName = (props) => {
  let className = OVERLAY_MENU_CSS_CLASS;
  if (!props.fullscreen) {
    className += ` ${OVERLAY_MENU_CSS_TOP_NAV_MODIFIER}`;
  }

  return className;
};

export const OverlayMenu = (props) => (
  <nav
    className={ overlayClassName(props) }
    onClick={ props.closeOverlayMenu }
  >
    <ul className='OverlayMenu-ul' onClick={ stopClickPropagation }>
      { props.children }
    </ul>
  </nav>
);

OverlayMenu.propTypes = {
  fullscreen: T.bool,
};

const mapDispatchProps = (dispatch) => ({
  closeOverlayMenu: () => dispatch(overlayMenuActions.closeOverlayMenu()),
});

export default connect(() => ({}), mapDispatchProps)(OverlayMenu);
