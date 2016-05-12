import { collections } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { receivedResponse } from './apiResponse';
import { OVERLAY_MENU_PARAMETER, COMMUNITY_MENU } from './overlayMenu';

const { SubscribedSubreddits } = collections;

export const FETCHING_SUBSCRIBED_SUBREDDITS = 'FETCHING_SUBSCRIBED_SUBREDDITS';

export const fetchingSubscribedSubreddits = () => ({ type: FETCHING_SUBSCRIBED_SUBREDDITS });

export const RECEIVED_SUBSCRIBED_SUBREDDITS = 'RECEIVED_SUBSCRIBED_SUBREDDITS';

export const receivedSubscribedSubreddits = (subscribedSubreddits) => ({
  type: RECEIVED_SUBSCRIBED_SUBREDDITS,
  subscribedSubreddits,
});

export const fetchSubscribedSubreddits = (onlyIfOverlay=false) => async (dispatch, getState) => {
  const state = getState();

  if (onlyIfOverlay) { // only fetch if we're rendering the overlay
    const { queryParams } = state.platform.currentPage;
    if (queryParams[OVERLAY_MENU_PARAMETER] !== COMMUNITY_MENU) {
      return;
    }
  }

  const { subscribedSubreddits } = state;
  if (subscribedSubreddits.fetching) { return; }

  dispatch(fetchingSubscribedSubreddits());
  const subscribedCollection = await SubscribedSubreddits.fetch(apiOptionsFromState(state));
  dispatch(receivedResponse(subscribedCollection.apiResponse));
  dispatch(receivedSubscribedSubreddits(subscribedCollection.apiResponse.results));
};
