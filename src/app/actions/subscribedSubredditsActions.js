import { collections } from '@r/api-client';
import { apiOptionsFromState } from '../../lib/apiOptionsFromState';
import { receivedResponse } from './apiResponseActions';

const { SubscribedSubreddits } = collections;

export const FETCHING_SUBSCRIBED_SUBREDDITS = 'FETCHING_SUBSCRIBED_SUBREDDITS';

export const fetchingSubscribedSubreddits = () => ({ type: FETCHING_SUBSCRIBED_SUBREDDITS });

export const RECEIVED_SUBSCRIBED_SUBREDDITS = 'RECEIVED_SUBSCRIBED_SUBREDDITS';

export const receivedSubscribedSubreddits = (subscribedSubreddits) => ({
  type: RECEIVED_SUBSCRIBED_SUBREDDITS,
  subscribedSubreddits,
});

export const fetchSubscribedSubreddits = () => async (dispatch, getState) => {
  const state = getState();
  const { subscribedSubreddits } = state;
  if (subscribedSubreddits.fetching) { return; }

  dispatch(fetchingSubscribedSubreddits());
  const subscribedCollection = await SubscribedSubreddits.fetch(apiOptionsFromState(state));
  dispatch(receivedResponse(subscribedCollection.apiResponse));
  dispatch(receivedSubscribedSubreddits(subscribedCollection.apiResponse.results));
};
