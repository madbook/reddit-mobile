import APIOptions, { optionsWithAuth } from '@r/api-client';

export const apiOptionsFromState = (state) => {
  if (!state) { return APIOptions; }

  const { session } = state;
  if (session && session.accessToken) {
    return optionsWithAuth(session.accessToken);
  }

  return APIOptions;
};
