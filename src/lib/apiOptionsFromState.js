import APIOptions, { optionsWithAuth } from '@r/api-client';
import merge from '@r/platform/merge';
import config from 'config';

export const apiOptionsFromState = state => {
  if (!state) { return APIOptions; }

  const { session } = state;
  const options = (session && session.accessToken)
    ? optionsWithAuth(session.accessToken)
    : { ...APIOptions };

  // grab loids if we have them, and set the cookie if on the server
  const {
    apiRequestHeaders,
    loid: { loid, loidCreated },
    meta,
  } = state;

  if (meta.env !== 'CLIENT') {
    // We fake cookie headers to pass loid and loidCreated to the server
    const cookieHeaders = [];
    if (loid) {
      cookieHeaders.push(`loid=${loid}`);
    }

    if (loidCreated) {
      cookieHeaders.push(`loidcreated=${loidCreated}}`);
    }

    return merge(options, {
      appName: '2x-server',
      headers: {
        ...config.apiHeaders, // default headers that are kept on the server
        ...apiRequestHeaders, // request dependant headers
        'Cookie': cookieHeaders.join(';'),
      },
    });
  }

  return merge(options, {
    appName: '2x-client',
  });
};
