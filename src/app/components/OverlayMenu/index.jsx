import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayMenuActions from 'app/actions/overlayMenu';
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
  closeOverlayMenu: () => dispatch(overlayMenuActions.closeOverlayMenu()),
});

export default connect(null, mapDispatchProps)(OverlayMenu);
