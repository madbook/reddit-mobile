import config from 'config';
import { permanentCookieOptions } from 'server/initialState/permanentCookieOptions';
import { SEPERATOR, VERSION } from './constants';

export default (ctx, session) => {
  // Set the token cookie to be on the root reddit domain if we're not
  // running on localhost
  const { host } = ctx.header || {};
  const options = permanentCookieOptions();
  if (host && host.indexOf('localhost') === -1) {
    options.domain = config.rootReddit;
  }

  ctx.cookies.set(
    'token',
    `${session.tokenString}${SEPERATOR}${VERSION}`,
    options
  );
};
