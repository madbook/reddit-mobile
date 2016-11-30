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
  // TODO(prashtx,2016-11-30): The API returns unexpected results for
  // /api/me.json when we add this query parameter. In particular, we fail to
  // receive experiment configuration data. We only perform the /api/me.json
  // call for logged-out users and only on the server. And we currently only
  // use the `redditWebClient` param to help enable outbound click tracking.
  // Since there are no outbound links to rewrite for shell renders, it should
  // be a safe, temporary workaround to skip the parameter for shell renders.
  // Non-shell renders are currently only for bots, which should not be subject
  // to user experiments (so the buggy /api/me.json results are not
  // problematic) and which will not encounter outbound click tracking rewrites
  // (so we don't really care if we add the `redditWebClient` parameter for
  // those "users" or not).
  if (!state.platform.shell) {
    options = {
      ...options,
      queryParams: {
        redditWebClient: 'mweb2x',
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
