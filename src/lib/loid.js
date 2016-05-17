import randomString from './randomString';

export function setLoggedOutCookies(cookies, config) {
  const loid = randomString(18);
  const loidcreated = (new Date()).toISOString();

  const options = {
    secure: config.https,
    secureProxy: config.httpsProxy,
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };

  cookies.set('loid', loid, options);
  cookies.set('loidcreated', loidcreated, options);

  return {
    loid,
    loidcreated,
    options,
  };
}
