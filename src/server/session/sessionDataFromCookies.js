import { atob } from 'Base64';

import clearSessionCookies from './clearSessionCookies';
import Session from 'app/models/Session';
import setSessionCookies from './setSessionCookies';
import { SEPERATOR, VERSION } from './constants';

// Helper function to session data from a given ctx.
// This function will either return a json dictionary you can pass to
// the Session model, or nothing. It does not handle refreshing anything.
// This does clear and/or write cookies as needed to convert cookies from the
// old 1X format to the new 2X+ format.
export default ctx => {
  const convertedSession = tryConverting1XCookies(ctx);
  if (convertedSession) {
    return convertedSession;
  }

  const tokenCookie = ctx.cookies.get('token');
  if (!tokenCookie) {
    return;
  }

  const [payloadBase64, version] = tokenCookie.split(SEPERATOR);
  if (parseInt(version, 10) !== VERSION) { // old format is implicit version 1
    // this is mostly a sanity check. if the version is not 2 (current) then the
    // the cookie is malformed somehow, or is a new format we don't expect.
    clearSessionCookies(ctx);
    return;
  }

  const session = JSON.parse(atob(payloadBase64));
  if (!session || !session.accessToken || !session.refreshToken || !session.expires) {
    clearSessionCookies(ctx);
    return;
  }

  return session;
};


// Handles parsing old 1X era cookies
// return value is a json dictionary describing the session, can be passed to
// the Session Model constructor.
//
// returns undefined if there were no valid 1X cookies;
export const tryConverting1XCookies = ctx => {
  const tokenCookie = ctx.cookies.get('token');
  const expiresCookie = ctx.cookies.get('tokenExpires');
  const refreshCookie = ctx.cookies.get('refreshToken');

  if (!tokenCookie) {
    if (expiresCookie || refreshCookie) {
      // just a sanity check
      clearSessionCookies(ctx);
    }

    return;
  }

  // The new format contains the SEPERATOR (period) to split up the encoded data
  //  and version. If there's a period we shouldn't do anything.
  if (tokenCookie.indexOf(SEPERATOR) !== -1) {
    return;
  }

  // No period means we have an old cookie
  // We should clear the old cookies, and if possible,
  // return session data based off the old cookies
  clearSessionCookies(ctx);

  if (!expiresCookie || !refreshCookie) {
    // Shouldn't happen unless there's some cookies getting malformed
    return;
  }

  const convertedSession = {
    accessToken: tokenCookie,
    refreshToken: refreshCookie,
    expires: (new Date(expiresCookie)).getTime(),
  };

  // Check the session to ensure it's valid before re-writing the new cookie
  // If its not valid, return the converted data and let the caller
  // try refreshing the session. The caller of this (or this files default export)
  // only is expected to parse data. The only reason this writes or clears
  // cookies is to ensure they're converted properly.
  const session = new Session(convertedSession);
  if (session.isValid) {
    setSessionCookies(ctx, session);
  }

  return convertedSession;
};
