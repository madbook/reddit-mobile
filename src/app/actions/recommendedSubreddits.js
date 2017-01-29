import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';

import RecommendedSubreddits from 'apiClient/apis/RecommendedSubreddits';
import ResponseError from 'apiClient/errors/ResponseError';

export const FETCHING_RECOMMENDED_SUBREDDITS = 'FETCHING_RECOMMENDED_SUBREDDITS';
export const fetching = name => ({
  type: FETCHING_RECOMMENDED_SUBREDDITS,
  name,
});

export const RECEIVED_RECOMMENDED_SUBREDDITS = 'RECEIVED_RECOMMENDED_SUBREDDITS';
export const received = (subredditName, apiResponse) => ({
  type: RECEIVED_RECOMMENDED_SUBREDDITS,
  subredditName,
  apiResponse,
});

export const FAILED = 'FAILED_RECOMMENDED_SUBREDDITS';
export const failed = (name, error) => ({
  type: FAILED,
  name,
  error,
});

export const fetchRecommendedSubreddits = (subredditName, max_recs=3) => {
  return async (dispatch, getState) => {
    if (isFakeSubreddit(subredditName)) { return; }

    const state = getState();
    dispatch(fetching(subredditName));
    const apiOptions = apiOptionsFromState(state);

    try {
      const response = await RecommendedSubreddits.get(
        apiOptions,
        { subreddit_name: subredditName, experiment_id: 70, max_recs },
      );
      dispatch(received(subredditName, response));
    } catch (e) {
      if (e instanceof ResponseError) {
        dispatch(failed(subredditName, e));
      } else {
        throw e;
      }
    }
  };
};
