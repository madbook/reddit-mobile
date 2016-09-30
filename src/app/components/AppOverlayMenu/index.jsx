import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as overlayActions from 'app/actions/overlay';

import CommunityOverlayMenu from 'app/components/CommunityOverlayMenu';
import SearchBarOverlay from 'app/components/SearchBarOverlay';
import SettingsOverlayMenu from 'app/components/SettingsOverlayMenu';
import PostSubmitOverlay from 'app/components/PostSubmitOverlay';

export const AppOverlayMenu = props => {
  const { subredditName } = props.pageData.urlParams;
  const { overlay } = props;

  switch (overlay) {
    case overlayActions.COMMUNITY_MENU:
      return <CommunityOverlayMenu />;

    case overlayActions.SEARCH_BAR:
      return <SearchBarOverlay />;

    case overlayActions.SETTINGS_MENU:
      return <SettingsOverlayMenu />;

    case overlayActions.POST_SUBMIT:
      return <PostSubmitOverlay subredditName={ subredditName } />;

    default: return null;
  }
};

const selector = createSelector(
  state => state.platform.currentPage,
  state => state.overlay,
  (pageData, overlay) => ({ pageData, overlay }),
);

export default connect(selector)(AppOverlayMenu);
