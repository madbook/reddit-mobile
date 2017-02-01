import { endpoints, errors } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';

const { SubredditRulesEndpoint } = endpoints;
const { ResponseError } = errors;

export const FETCHING_SUBREDDIT_RULES = 'FETCHING_SUBREDDIT_RULES';
export const fetching = subredditName => ({
  type: FETCHING_SUBREDDIT_RULES,
  subredditName,
});

export const RECEIVED_SUBREDDIT_RULES = 'RECEIVED_SUBREDDIT_RULES';
export const received = (subredditName, rules) => ({
  type: RECEIVED_SUBREDDIT_RULES,
  subredditName,
  rules,
});

export const FAILED = 'FAILED_SUBREDDIT_RULES';
export const failed = (subredditName, error) => ({
  type: FAILED,
  subredditName,
  error,
});

/**
 * Fetch subreddit rules for a subreddit.
 * @function
 * @param {string} subredditName The name of the subreddit
 */
export const fetchSubredditRules = subredditName => async (dispatch, getState) => {
  if (isFakeSubreddit(subredditName)) { return; }

  const state = getState();
  const apiOptions = apiOptionsFromState(state);

  const pendingRequest = state.subredditRulesRequests[subredditName];
  if (pendingRequest && !(pendingRequest.failed || pendingRequest.loading)) {
    return;
  }

  dispatch(fetching(subredditName));

  try {
    const res = await SubredditRulesEndpoint.get(apiOptions, subredditName);
    const rules = res.results.map(r => res.getModelFromRecord(r));

    dispatch(received(subredditName, rules));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(subredditName, e));
    } else {
      throw e;
    }
  }
};
