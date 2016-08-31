import randomString from './randomString';
import { permanentCookieOptions } from 'server/initialState/permanentCookieOptions';

export function setLoggedOutCookies(cookies) {
  const loid = randomString(18);
  const loidcreated = (new Date()).toISOString();

  const options = permanentCookieOptions();

  cookies.set('loid', loid, options);
  cookies.set('loidcreated', loidcreated, options);

  return {
    loid,
    loidcreated,
    options,
  };
}
