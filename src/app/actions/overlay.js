export const TOGGLE_OVERLAY = 'TOGGLE_OVERLAY';
export const toggle = kind => ({
  type: TOGGLE_OVERLAY,
  kind,
});

export const CLOSE_OVERLAY = 'CLOSE_OVERLAY';
export const closeOverlay = () => ({
  type: CLOSE_OVERLAY,
});

export const COMMUNITY_MENU = 'COMMUNITY_MENU';
export const toggleCommunityMenu = () => toggle(COMMUNITY_MENU);

export const SEARCH_BAR = 'SEARCH_BAR';
export const toggleSearchBar = () => toggle(SEARCH_BAR);

export const SETTINGS_MENU = 'SETTINGS_MENU';
export const toggleSettingsMenu = () => toggle(SETTINGS_MENU);

export const POST_SUBMIT = 'POST_SUBMIT';
export const togglePostSubmit = () => toggle(POST_SUBMIT);
