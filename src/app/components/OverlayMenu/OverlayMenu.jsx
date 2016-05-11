import './OverlayMenu.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayMenuActions from '../../actions/overlayMenuUrlsAndActions';

import { OVERLAY_MENU_CSS_CLASS } from '../../constants';

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

export const OverlayMenu = (props) => (
  <nav
    className={ `${OVERLAY_MENU_CSS_CLASS} tween` }
    onClick={ this._closeIfClickedOut }
  >
    <ul className='OverlayMenu-ul list-unstyled' onClick={ stopClickPropagation }>
      { props.children }
    </ul>
  </nav>
);

const selector = createSelector(
  (_, props) => props.children,
  (children) => ({ children }),
);

const mapDispatchProps = (dispatch) => ({
  closeOverlayMenu: dispatch(overlayMenuActions.closeOverlayMenu()),
});

export default connect(selector, mapDispatchProps)(OverlayMenu);
