import SubredditRule from 'apiClient/models/SubredditRule';

import * as loginActions from 'app/actions/login';
import * as subredditRulesActions from 'app/actions/subredditRules';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case subredditRulesActions.RECEIVED_SUBREDDIT_RULES: {
      const { subredditName, subredditRules, siteRules } = action;
      return {
        [subredditName]: subredditRules,
        [SubredditRule.SITE_RULE_SUBREDDIT_NAME]: siteRules,
        ...state,
      };
    }

    default: return state;
  }
}
