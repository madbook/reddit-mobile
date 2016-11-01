import APIOptions, { optionsWithAuth } from '@r/api-client';
import merge from '@r/platform/merge';
import config from 'config';

export const apiOptionsFromState = state => {
  if (!state) { return APIOptions; }

  const { session } = state;
  let options = (session && session.accessToken)
    ? optionsWithAuth(session.accessToken)
    : { ...APIOptions };
    
  // TEST: We're testing outbound links for employees only. To do this,
  // we only send the `X-Reddit-Web-Client` client if the logged in user
  // is an employee.
  const { user, accounts } = state;
  const userAccount = user.loggedOut ? null : accounts[user.name];
  if (userAccount && userAccount.isEmployee) {
    options = {
      ...options,
      headers: {
        'X-Reddit-Web-Client': 'mweb2x',
      },
    };
  }

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
