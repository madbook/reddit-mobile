import { endpoints } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { receivedResponse } from './apiResponse';

const { SubredditEndpoint } = endpoints;

export const FETCHING_SUBREDDIT = 'FETCHING_SUBREDDIT';
export const fetchingSubreddit = (name) => ({ type: FETCHING_SUBREDDIT, name });

export const RECEIEVED_SUBREDDIT = 'RECEIEVED_SUBREDDIT';
export const receivedSubreddit = (name) => ({ type: RECEIEVED_SUBREDDIT, name });

export const fetchSubreddit = (name) => async (dispatch, getState) => {
  const state = getState();
  const pendingRequest = state.subredditRequests[name];
  if (pendingRequest && pendingRequest.loading) { return; }

  dispatch(fetchingSubreddit(name));

  try {
    const response = await SubredditEndpoint.get(apiOptionsFromState(state), { id: name });
    dispatch(receivedResponse(response));
    dispatch(receivedSubreddit(name));
  } catch (e) {
    // add a failed state explicitly?
    dispatch(receivedSubreddit(name));
  }
};
