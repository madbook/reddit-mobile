import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayMenuUrlsAndActions from '../../actions/overlayMenuUrlsAndActions';

import OverlayMenu from '../OverlayMenu/OverlayMenu';

export const AppOverlayMenu = (props) => {
  const overlayMenu = props.pageData.queryParams[overlayMenuUrlsAndActions.OVERLAY_MENU_PARAMETER];
  if (!overlayMenu) { return null; }

  return <OverlayMenu />;
};

const selector = createSelector(
  (state) => state.platform.currentPage,
  (pageData) => ({ pageData }),
);

export default connect(selector)(AppOverlayMenu);
