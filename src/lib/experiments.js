export function extractUser(state) {
  if (!state || !state.user || !state.accounts) {
    return;
  }
  return state.accounts[state.user.name];
}

export function getExperimentData(state, experimentName) {
  const user = extractUser(state);
  if (!user || !user.features[experimentName]) {
    return null;
  }
  return {
    ...user.features[experimentName],
    experiment_name: experimentName,
  };
}

export function featureEnabled(state, featureName) {
  // some feature flags are just true/false and don't have experiment
  // variants and their associated bucketing events. They're useful
  // for ramping up / down, and quicky enabling / disabling certain features
  const user = extractUser(state);
  if (!user) {
    return false;
  }

  return !!user.features[featureName];
}
