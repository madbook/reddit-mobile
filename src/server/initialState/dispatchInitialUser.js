import setCookieParser from 'set-cookie-parser';

import * as userActions from 'app/actions/user';
import * as loidActions from 'app/actions/loid';
import { permanentRootCookieOptions } from './permanentRootCookieOptions';

export const dispatchInitialUser = async (ctx, dispatch, getState) => {
  // the lack of camel casing on the 'loidcreated' cookie name is intentional.
  const loidCookie = ctx.cookies.get('loid');
  const loidCreatedCookie = ctx.cookies.get('loidcreated');

  if (loidCookie && loidCookie.includes('.')) {
    // If there's a `.`, we have the new format of loids,
    // we ignore the loid created cookie and use whatever is in the loid payload
    const [loid, /* version */, loidCreated] = loidCookie.split('.');
    dispatch(loidActions.setLOID({
      loid,
      loidCookie,
      loidCreated,
      loidCreatedCookie,
    }));
  } else {
    dispatch(loidActions.setLOID({
      loid: loidCookie,
      loidCookie,
      loidCreated: loidCreatedCookie,
      loidCreatedCookie,
    }));
  }

  // fetchMyUser pulls in the loid and loidCreated fields
  await dispatch(userActions.fetchMyUser());

  const state = getState();

  // First, ensure that the account request succeeded.
  // If the request didn't succeed, we don't have any new information
  // to update cookies with
  if (!state.accountRequests.me || state.accountRequests.me.failed) {
    return;
  }

  // If there were set-cookie headers on the account request, set them
  const options = permanentRootCookieOptions(ctx);
  const { meta } = state.accountRequests.me;
  const setCookieHeaders = (meta && meta['set-cookie']) || [];
  setCookieHeaders.forEach(setCookieHeader => {
    const { name, value } = setCookieParser.parse(setCookieHeader)[0];
    ctx.cookies.set(name, value, options);
  });
};
