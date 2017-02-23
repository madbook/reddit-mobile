import ResponseError from 'apiClient/errors/ResponseError';
import SubredditRulesEndpoint from 'apiClient/apis/SubredditRulesEndpoint';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';

export const FETCHING_SUBREDDIT_RULES = 'FETCHING_SUBREDDIT_RULES';
export const fetching = subredditName => ({
  type: FETCHING_SUBREDDIT_RULES,
  subredditName,
});

export const RECEIVED_SUBREDDIT_RULES = 'RECEIVED_SUBREDDIT_RULES';
export const received = (subredditName, subredditRules, siteRules) => ({
  type: RECEIVED_SUBREDDIT_RULES,
  subredditName,
  subredditRules,
  siteRules,
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
    const allRules = res.results.map(r => res.getModelFromRecord(r));

    const subredditRules = allRules.filter(r => !r.isSiteRule());
    const siteRules = allRules.filter(r => r.isSiteRule());

    dispatch(received(subredditName, subredditRules, siteRules));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(subredditName, e));
    } else {
      throw e;
    }
  }
};
