import APIOptions, { optionsWithAuth } from '@r/api-client';
import merge from '@r/platform/merge';

export const apiOptionsFromState = state => {
  if (!state) { return APIOptions; }

  const { session } = state;
  const options = (session && session.accessToken)
    ? optionsWithAuth(session.accessToken)
    : { ...APIOptions };

  // grab loids if we have them, and set the cookie if on the server
  const { loid: { loid, loidCreated }, meta } = state;
  if (loid && meta.env !== 'CLIENT') {
    return merge(options, {
      appName: '2x-server',
      headers: {
        'Cookie': `loid=${loid}; loidcreated=${(new Date(loidCreated)).toISOString()}`,
      },
    });
  }

  return merge(options, {
    appName: '2x-client',
  });
};
