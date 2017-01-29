import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';
import SubredditEndpoint from 'apiClient/apis/SubredditEndpoint';
import ResponseError from 'apiClient/errors/ResponseError';

export const FETCHING_SUBREDDIT = 'FETCHING_SUBREDDIT';
export const fetching = name => ({
  type: FETCHING_SUBREDDIT,
  name,
});

export const RECEIVED_SUBREDDIT = 'RECEIVED_SUBREDDIT';
export const received = (name, model) => ({
  type: RECEIVED_SUBREDDIT,
  name,
  model,
});

export const FAILED = 'FAILED_SUBREDDIT';
export const failed = (name, error) => ({
  type: FAILED,
  name,
  error,
});

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
    if (e instanceof ResponseError) {
      dispatch(failed(name, e));
    } else {
      throw e;
    }
  }
};
