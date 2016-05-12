import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayMenuActions from 'app/actions/overlayMenu';

import { OVERLAY_MENU_CSS_CLASS } from 'app/constants';

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

export const OverlayMenu = (props) => (
  <nav
    className={ OVERLAY_MENU_CSS_CLASS }
    onClick={ props.closeOverlayMenu }
  >
    <ul className='OverlayMenu-ul' onClick={ stopClickPropagation }>
      { props.children }
    </ul>
  </nav>
);

const mapDispatchProps = (dispatch) => ({
  closeOverlayMenu: () => dispatch(overlayMenuActions.closeOverlayMenu()),
});

export default connect(() => ({}), mapDispatchProps)(OverlayMenu);
