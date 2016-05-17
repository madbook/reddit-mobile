import { atob } from 'Base64';
import { PrivateAPI } from '@r/private';

import Session from '../../app/models/Session';
import makeSessionFromData from './makeSessionFromData';
import setSessionCookies from './setSessionCookies';
import * as sessionActions from '../../app/actions/session';

export default async (ctx, dispatch, apiOptions) => {
  // try to create a session from the existing cookie
  // if the session is malformed somehow, the catch will trigger when trying
  // to access it
  const tokenCookie = ctx.cookies.get('token');
  const redditSessionExists = ctx.cookies.get('reddit_session');
  if (!(tokenCookie || redditSessionExists)) {
    return;
  }

  let session;
  let sessionData;

  if (tokenCookie) {
    sessionData = JSON.parse(atob(tokenCookie));
    session = new Session(sessionData);
  } else {
    // try to convert reddit session cookie
    const cookies = ctx.headers.cookie.replace(/__cf_mob_redir=1/, '__cf_mob_redir=0').split(';');
    sessionData = await PrivateAPI.convertCookiesToAuthToken(apiOptions, cookies);
    session = new Session(sessionData);
  }

  // if the session is invalid, try to use the refresh token to grab a new
  // session.
  if (!session.isValid) {
    const data = await PrivateAPI.refreshToken(apiOptions, sessionData.refreshToken);
    session = makeSessionFromData({ ...data, refresh_token: sessionData.refreshToken });

    // don't forget to set the cookies with the new session, or the session
    // will remain invalid the next time the page is fetched
    setSessionCookies(ctx, session);
  }

  // push the session into the store
  dispatch(sessionActions.setSession(session));
};
