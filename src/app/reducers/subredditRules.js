import mergeUpdatedModel from './helpers/mergeUpdatedModel';
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
      const { subredditName, rules } = action;
      return {
        [subredditName]: rules,
        ...state
      };
    }

    default: return state;
  }
}
