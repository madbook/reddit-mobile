import * as loidActions from 'app/actions/loid';
import { setLoggedOutCookies } from 'lib/loid';

export const dispatchInitialLoid = async (ctx, dispatch) => {
  let loid = ctx.cookies.get('loid');

  if (!loid) {
    // TODO: get a real config object onto state and pass it here
    loid = setLoggedOutCookies(ctx.cookies, {}).loid;
  }

  dispatch(loidActions.setLOID(loid));
};
