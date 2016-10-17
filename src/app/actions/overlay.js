import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData } from 'lib/eventUtils';

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


export const SETTINGS_MENU = 'SETTINGS_MENU';
export const toggleSettingsMenu = () => toggle(SETTINGS_MENU);

export const POST_SUBMIT = 'POST_SUBMIT';
export const togglePostSubmit = () => toggle(POST_SUBMIT);


export const SEARCH_BAR = 'SEARCH_BAR';

export const openSearchBar = () => async (dispatch, getState) => {
  trackSearchBar('cs.search_opened', getState());
  dispatch(toggle(SEARCH_BAR));
};

export const closeSearchBar = () => async (dispatch, getState) => {
  trackSearchBar('cs.search_cancelled', getState());
  dispatch(toggle(SEARCH_BAR));
};

function trackSearchBar(event_topic, state) {
  getEventTracker().track('search_events', event_topic, {
    ...getBasePayload(state),
    ...buildSubredditData(state),
  });
}
