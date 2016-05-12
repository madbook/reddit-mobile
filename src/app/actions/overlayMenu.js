import { navigateToUrl } from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import { urlWith, urlWithQueryParamToggled } from 'lib/urlWith';
import { omit } from 'lodash/object';

export const OVERLAY_MENU_PARAMETER = 'overlayMenu';
export const SETTINGS_MENU = 'settings';
export const COMMUNITY_MENU = 'community';

export const urlWithSettingsMenuToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, SETTINGS_MENU);
};

export const urlWithCommunityMenuToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, COMMUNITY_MENU);
};

export const urlWithoutOverlayMenu = (url, queryParams) => {
  return urlWith(url, omit(queryParams, OVERLAY_MENU_PARAMETER));
};

export const openOverlayMenu = (menu) => async (dispatch, getState) => {
  const state = getState();
  const { url, queryParams } = state.platform.currentPage;
  dispatch(navigateToUrl(METHODS.GET, url, { ...queryParams, [OVERLAY_MENU_PARAMETER]: menu }));
};

export const closeOverlayMenu = () => async (dispatch, getState) => {
  const state = getState();
  const { url, queryParams } = state.platform.currentPage;
  dispatch(navigateToUrl(METHODS.GET, url, omit(queryParams, OVERLAY_MENU_PARAMETER)));
};
