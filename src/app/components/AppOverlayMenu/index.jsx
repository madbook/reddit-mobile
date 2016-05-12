import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayMenuUrlsAndActions from 'app/actions/overlayMenu';

import CommunityOverlayMenu from '../CommunityOverlayMenu';
import SettingsOverlayMenu from '../SettingsOverlayMenu';

export const AppOverlayMenu = (props) => {
  const overlayMenu = props.pageData.queryParams[overlayMenuUrlsAndActions.OVERLAY_MENU_PARAMETER];

  switch (overlayMenu) {
    case overlayMenuUrlsAndActions.COMMUNITY_MENU:
      return <CommunityOverlayMenu />;

    case overlayMenuUrlsAndActions.SETTINGS_MENU:
      return <SettingsOverlayMenu />;

    default: return null;
  }
};

const selector = createSelector(
  (state) => state.platform.currentPage,
  (pageData) => ({ pageData }),
);

export default connect(selector)(AppOverlayMenu);
