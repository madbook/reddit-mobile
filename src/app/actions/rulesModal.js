export const RULES_MODAL_ACCEPTED = 'RULES_MODAL__ACCEPTED';

export function getLocalStorageKey(featureName, subredditName) {
  return `${featureName}_${subredditName}`;
}

export const accept = (featureName, subredditName) => ({
  type: RULES_MODAL_ACCEPTED,
  featureName,
  subredditName,
});
