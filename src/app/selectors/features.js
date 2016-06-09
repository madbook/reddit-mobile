import features from 'app/featureFlags';

export const featuresSelector = (state) => features.withContext({ state });
