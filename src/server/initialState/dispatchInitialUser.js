import * as userActions from 'app/actions/user';
import * as loidActions from 'app/actions/loid';
import { permanentRootCookieOptions } from './permanentRootCookieOptions';
import { logServerError } from 'lib/errorLog';

export const dispatchInitialUser = async (ctx, dispatch, getState) => {
  // the lack of camel casing on the 'loidcreated' cookie name is intentional.
  const oldLoid = ctx.cookies.get('loid');
  const oldLoidCreated = ctx.cookies.get('loidcreated');

  // set the old loids into state. when we fetch the user, these might get
  // passed along with the api call so the backend knows how to associate the
  // logged out user with the logged in one.
  dispatch(loidActions.setLOID(oldLoid, oldLoidCreated));

  // fetchMyUser pulls in the loid and loidCreated fields
  await dispatch(userActions.fetchMyUser());

  const state = getState();

  // First, ensure that the account request succeeded.
  // If the request didn't succeed, we don't have any new information
  // to update loid and loidCreated cookies.
  // Fastly adds loidCreated values in milliseconds to our cookies,
  // if the account request fails, we'll be calling `new Date` on whatever
  // was in the cookies. Milliseconds timestamp strings throw an exception
  // if they're not converted to an int, which we don't do for other reasons.
  // There is a very near future where our loid* cookies are unified, so this
  // will go away soon.
  if (!state.accountRequests.me || state.accountRequests.me.failed) {
    return;
  }

  const { loid: { loid, loidCreated } } = state;

  // there is a future in which the two of these are combined into one field,
  // just called loid. so, we should check for the existence of loid and
  // loidCreated independently, and set each cookie on its own.
  const options = permanentRootCookieOptions(ctx);

  if (loid && (loid !== oldLoid)) {
    ctx.cookies.set('loid', loid, options);
  }

  // oldLoidCreated is always an ISO string, since that's how it's stored in the
  // cookie. loidCreated, however, is in ms since that's how we get it back from
  // the api. so, to compare the two, we need to convert loidCreated to an
  // ISO string.
  if (loidCreated) {
    try { // `toISOString` can throw if we get an invalid timestamp back from the server
      const loidCreatedISO = (new Date(loidCreated)).toISOString();
      if (loidCreatedISO !== oldLoidCreated) {
        ctx.cookies.set('loidcreated', loidCreatedISO, options);
      }
    } catch (error) {
      logServerError(error, ctx);
    }
  }
};
