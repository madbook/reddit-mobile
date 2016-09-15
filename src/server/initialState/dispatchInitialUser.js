import * as userActions from 'app/actions/user';
import * as loidActions from 'app/actions/loid';
import { permanentRootCookieOptions } from './permanentRootCookieOptions';

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
  const { loid: { loid, loidCreated } } = getState();

  // there is a future in which the two of these are combined into one field,
  // just called loid. so, we should check for the existence of loid and
  // loidCreated independently, and set each cookie on its own.
  const options = permanentRootCookieOptions(ctx);

  if (loid && (loid !== oldLoid)) {
    ctx.cookies.set('loid', loid, options);
  }

  if (loidCreated && (loidCreated !== oldLoidCreated)) {
    ctx.cookies.set('loidcreated', new Date(loidCreated).toISOString(), options);
  }
};
