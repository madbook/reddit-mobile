import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayMenuUrlsAndActions from 'app/actions/overlayMenu';

import CommunityOverlayMenu from 'app/components/CommunityOverlayMenu';
import SearchBarOverlay from 'app/components/SearchBarOverlay';
import SettingsOverlayMenu from 'app/components/SettingsOverlayMenu';
import PostSubmitOverlay from 'app/components/PostSubmitOverlay';

export const AppOverlayMenu = (props) => {
  const overlayMenu = props.pageData.queryParams[overlayMenuUrlsAndActions.OVERLAY_MENU_PARAMETER];

  switch (overlayMenu) {
    case overlayMenuUrlsAndActions.COMMUNITY_MENU:
      return <CommunityOverlayMenu />;

    case overlayMenuUrlsAndActions.SEARCH_BAR:
      return <SearchBarOverlay />;

    case overlayMenuUrlsAndActions.SETTINGS_MENU:
      return <SettingsOverlayMenu />;

    case overlayMenuUrlsAndActions.POST_SUBMIT:
      return <PostSubmitOverlay />;

    default: return null;
  }
};

const selector = createSelector(
  (state) => state.platform.currentPage,
  (pageData) => ({ pageData }),
);

export default connect(selector)(AppOverlayMenu);
