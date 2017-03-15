import SubredditRule from 'apiClient/models/SubredditRule';

/**
 * Helper to get subreddit rules from state.
 * @param {Object} state 
 * @param {string} subredditName 
 * @param {string} [thingType] Optionally filters the returned rules down to
 *    only those that apply to the given thingType
 * @returns {?SubredditRule[]} Returns null if the rules do not exist in state.
 */
export function getSubredditRulesFromState(state, subredditName, thingType) {
  // If there is a name, but it isn't in the subredditRules state yet, that
  // means we haven't pulled down the rules yet and therefore don't know
  // if any exist.
  if (subredditName && !(subredditName in state.subredditRules)) {
    return null;
  }

  // If there is no subreddit associated with the thing being reported, or
  // the subreddit has no rules, return an empty list.
  if (!state.subredditRules[subredditName]) {
    return [];
  }

  const rules = state.subredditRules[subredditName];

  if (!thingType) {
    return rules;
  } else {
    return rules.filter(rule => rule.doesRuleApplyToThingType(thingType));
  }
}

/**
 * Helper to get site-wide rules from state.
 * @param {Object} state 
 * @returns {?SubredditRule[]} Returns null if the rules do not exist in state.
 */
export function getSiteRulesFromState(state) {
  return state.subredditRules[SubredditRule.SITE_RULE_SUBREDDIT_NAME] || null;
}
