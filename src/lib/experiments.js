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
