import * as subredditRulesActions from 'app/actions/subredditRules';

export const RULES_MODAL_DISPLAYED = 'RULES_MODAL__DISPLAYED';
export const RULES_MODAL_ACCEPTED = 'RULES_MODAL__ACCEPTED';

export const RULES_MODAL_TYPE = 'RULES_MODAL__TYPE';

export function getLocalStorageKey(featureName, subredditName) {
  return `${featureName}_${subredditName}`;
}

export function display(featureName, subredditName, thingType, isRequired, onDecline) {
  return async (dispatch, getState) => {
    dispatch({
      type: RULES_MODAL_DISPLAYED,
      modalType: RULES_MODAL_TYPE,
      modalProps: {
        featureName,
        isRequired,
        onDecline,
        subredditName,
        thingType,
      },
    });

    // Since we need the subreddit rules to render the modal, fetch them if
    // if they aren't already available
    const state = getState();
    if (!state.subredditRules[subredditName]) {
      const fetchRules = subredditRulesActions.fetchSubredditRules(subredditName);
      await fetchRules(dispatch, getState);
    }
  }
}

export const accept = (featureName, subredditName) => ({
  type: RULES_MODAL_ACCEPTED,
  featureName,
  subredditName,
});
