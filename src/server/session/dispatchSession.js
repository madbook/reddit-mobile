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
  const token = ctx.cookies.get('token');
  const redditSession = ctx.cookies.get('reddit_session');

  let session;
  let sessionData;

  if (token) { // if we're working with the new session type
    sessionData = JSON.parse(atob(token));
    session = new Session(sessionData);
  } else if (redditSession) { // we detect a legacy reddit.com session
    const cookies = ctx.headers.cookie.replace('__cf_mob_redir=1', '__cf_mob_redir=0').split(';');
    sessionData = makeSessionFromData(await PrivateAPI.convertCookiesToAuthToken(apiOptions, cookies));
    session = new Session(sessionData);

    // since we converted a legacy session into a 2X token, we want to make sure
    // we forward the new cookies for the token
    setSessionCookies(ctx, session);
  }

  // if the session is invalid, try to use the refresh token to grab a new
  // session.
  if (session && sessionData && !session.isValid) {
    const data = await PrivateAPI.refreshToken(apiOptions, sessionData.refreshToken);
    session = makeSessionFromData({ refresh_token: sessionData.refreshToken, ...data });

    // don't forget to set the cookies with the new session, or the session
    // will remain invalid the next time the page is fetched
    setSessionCookies(ctx, session);
  }

  if (session && session.isValid) {
    dispatch(sessionActions.setSession(session));
  }
};
