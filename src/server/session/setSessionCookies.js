import { permanentRootCookieOptions } from 'server/initialState/permanentRootCookieOptions';
import { SEPERATOR, VERSION } from './constants';

export default (ctx, session) => {
  // Set the token cookie to be on the root reddit domain if we're not
  // running on localhost
  const options = {
    ...permanentRootCookieOptions(ctx),
    httpOnly: true, // don't let client-side javascript access session cookies
  };

  ctx.cookies.set(
    'token',
    `${session.tokenString}${SEPERATOR}${VERSION}`,
    options
  );
};
