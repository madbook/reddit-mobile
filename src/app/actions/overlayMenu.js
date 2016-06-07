import { navigateToUrl } from '@r/platform/actions';
import { METHODS } from '@r/platform/router';
import shouldGoBack from '@r/platform/shouldGoBack';

import { urlWith, urlWithQueryParamToggled } from 'lib/urlWith';
import omit from 'lodash/omit';

export const OVERLAY_MENU_PARAMETER = 'overlayMenu';
export const COMMUNITY_MENU = 'community';
export const SEARCH_BAR = 'search';
export const SETTINGS_MENU = 'settings';
export const POST_SUBMIT = 'submit';

export const urlWithCommunityMenuToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, COMMUNITY_MENU);
};

export const urlWithPostSubmitMenuToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, POST_SUBMIT);
};

export const urlWithSearchBarToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, SEARCH_BAR);
};

export const urlWithSettingsMenuToggled = (url, queryParams) => {
  return urlWithQueryParamToggled(url, queryParams, OVERLAY_MENU_PARAMETER, SETTINGS_MENU);
};

export const urlWithoutOverlayMenu = (url, queryParams) => {
  return urlWith(url, omit(queryParams, OVERLAY_MENU_PARAMETER));
};

export const openOverlayMenu = menu => async (dispatch, getState) => {
  const state = getState();
  const { url, queryParams } = state.platform.currentPage;
  dispatch(navigateToUrl(METHODS.GET, url, { ...queryParams, [OVERLAY_MENU_PARAMETER]: menu }));
};

export const closeOverlayMenu = () => async (dispatch, getState) => {
  const state = getState();
  const { url, queryParams } = state.platform.currentPage;
  const newParams = omit(queryParams, OVERLAY_MENU_PARAMETER);
  const urlHistory = state.platform.history;
  const currentIndex = state.platform.currentPageIndex;

  if (shouldGoBack(urlHistory, currentIndex, url, newParams)) {
    history.back();
    return;
  }

  dispatch(navigateToUrl(METHODS.GET, url, newParams));
};
