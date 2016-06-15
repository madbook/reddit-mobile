import { endpoints } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';

const { SubredditEndpoint } = endpoints;

export const FETCHING_SUBREDDIT = 'FETCHING_SUBREDDIT';
export const fetching = name => ({ type: FETCHING_SUBREDDIT, name });

export const RECEIVED_SUBREDDIT = 'RECEIVED_SUBREDDIT';
export const received = (name, model) => ({ type: RECEIVED_SUBREDDIT, name, model });

export const FAILED_SUBREDDIT = 'FAILED_SUBREDDIT';
export const failed = name => ({ type: FAILED_SUBREDDIT, name });

export const fetchSubreddit = (name) => async (dispatch, getState) => {
  if (isFakeSubreddit(name)) { return; }

  const state = getState();
  const pendingRequest = state.subredditRequests[name];
  if (pendingRequest && !pendingRequest.failed && !pendingRequest.loading) {
    return;
  }

  dispatch(fetching(name));

  try {
    const response = await SubredditEndpoint.get(apiOptionsFromState(state), { id: name });
    const model = response.getModelFromRecord(response.results[0]);
    dispatch(received(name, model));
  } catch (e) {
    dispatch(failed(name));
  }
};
