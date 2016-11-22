import APIOptions, { optionsWithAuth } from '@r/api-client';
import merge from '@r/platform/merge';
import config from 'config';

export const apiOptionsFromState = state => {
  if (!state) { return APIOptions; }

  const { session } = state;
  let options = (session && session.accessToken)
    ? optionsWithAuth(session.accessToken)
    : { ...APIOptions };

  // Identify ourselves as the mweb app for api purposes
  options = {
    ...options,
    queryParams: {
      redditWebClient: 'mweb2x',
    },
  };

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
      cookieHeaders.push(`loidcreated=${loidCreated}`);
    }

    return merge(options, {
      appName: '2x-server',
      headers: {
        ...options.headers, // grab any headers we've already set
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
