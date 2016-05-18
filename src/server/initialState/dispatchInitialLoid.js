import * as loidActions from 'app/actions/loid';
import { setLoggedOutCookies } from 'lib/loid';

export const dispatchInitialLoid = async (ctx, dispatch) => {
  let loid = ctx.cookies.get('loid');
  let loidcreated = ctx.cookies.get('loidcreated');

  if (!loid) {
    // TODO: get a real config object onto state and pass it here
    const cookies = setLoggedOutCookies(ctx.cookies, {});
    loid = cookies.loid;
    loidcreated = cookies.loidcreated;
  }

  dispatch(loidActions.setLOID(loid, loidcreated));
};
