import { makeOptions } from './apiBase/APIRequestUtils';

const DEFAULT_API_ORIGIN = 'https://www.reddit.com';
const AUTHED_API_ORIGIN = 'https://oauth.reddit.com';

const DefaultOptions = {
  origin: DEFAULT_API_ORIGIN,
  userAgent: 'snoodev3',
  appName: 'snoodev3',
  env: process.env.NODE_ENV || 'dev',
};

export const APIOptions = makeOptions(DefaultOptions);

export const optionsWithAuth = token => {
  return {
    ...DefaultOptions,
    token,
    origin: token ? AUTHED_API_ORIGIN : DEFAULT_API_ORIGIN,
  };
};
