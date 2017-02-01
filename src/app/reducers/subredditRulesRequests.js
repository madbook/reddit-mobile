import merge from '@r/platform/merge';

import * as subredditRulesActions from 'app/actions/subredditRules';
import { newSubredditRulesRequest } from 'app/models/SubredditRulesRequests';

export const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case subredditRulesActions.FETCHING_SUBREDDIT_RULES: {
      const { subredditName } = action;
      const currentRequest = state[subredditName];
      if (currentRequest && currentRequest.loading) { return state; }

      return merge(state, {
        [subredditName]: newSubredditRulesRequest(subredditName),
      });
    }

    case subredditRulesActions.RECEIVED_SUBREDDIT_RULES: {
      const { subredditName } = action;
      const currentRequest = state[subredditName];
      if (!(currentRequest && currentRequest.loading)) { return state; }

      return merge(state, { [subredditName]: { loading: false } });
    }

    case subredditRulesActions.FAILED: {
      const { subredditName } = action;
      const currentRequest = state[subredditName];
      if (!(currentRequest && currentRequest.loading)) { return state; }

      return merge(state, { [subredditName]: { loading: false, failed: true } });
    }
    default: return state;
  }
};
