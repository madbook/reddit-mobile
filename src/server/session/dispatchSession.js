import { PrivateAPI } from '@r/private';

import config from 'config';
import errorLog from 'lib/errorLog';
import proxiedApiOptions from 'lib/proxiedApiOptions';
import Session from 'app/models/Session';
import makeSessionFromData from './makeSessionFromData';
import sessionDataFromCookies from './sessionDataFromCookies';
import setSessionCookies from './setSessionCookies';
import clearSessionCookies from './clearSessionCookies';
import * as sessionActions from 'app/actions/session';

export const logError = (ctx, error) => {
  // manually call errorLog so we don't have to re-throw any errors
  errorLog({
    error,
    userAgent: 'SERVER',
    requestUrl: ctx.url,
  }, {
    hivemind: config.statsURL,
  });
};


export default async (ctx, dispatch, apiOptions) => {
  // try to create a session from the existing cookie
  // if the session is malformed somehow, the catch will trigger when trying
  // to access it
  const redditSession = ctx.cookies.get('reddit_session');

  let session;
  let sessionData;

  try {
    sessionData = sessionDataFromCookies(ctx);
    if (sessionData) {
      session = new Session(sessionData);
    }
  } catch (e) {
    // Most likely an error in parsing the encoded json,
    // log the error, clear the bad cookies, and continue to
    // see if the session conversion works.
    session = undefined;
    sessionData = undefined;
    clearSessionCookies(ctx);
    logError(e);
  }

  if (!session && redditSession) {
    const cookies = ctx.headers.cookie.replace('__cf_mob_redir=1', '__cf_mob_redir=0').split(';');
    sessionData = makeSessionFromData(await PrivateAPI.convertCookiesToAuthToken(
      proxiedApiOptions(ctx, apiOptions), cookies, ctx.orderedHeaders, ctx.headers['user-agent'],
    ));
    session = new Session(sessionData);

    // since we converted a legacy session into a 2X token, we want to make sure
    // we forward the new cookies for the token
    setSessionCookies(ctx, session);
  }

  // if the session is invalid, try to use the refresh token to grab a new
  // session.
  if (session && sessionData && !session.isValid) {
    const data = await PrivateAPI.refreshToken(
      proxiedApiOptions(ctx, apiOptions), sessionData.refreshToken,
      ctx.orderedHeaders, ctx.headers['user-agent']
    );

    session = makeSessionFromData({
      ...data,
      // use the newest refresh token we have available,
      refresh_token: data.refresh_token || sessionData.refreshToken,
    });

    // don't forget to set the cookies with the new session, or the session
    // will remain invalid the next time the page is fetched
    setSessionCookies(ctx, session);
  }

  if (session && session.isValid) {
    dispatch(sessionActions.setSession(session));
  }
};
