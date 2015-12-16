import randomString from './randomString';

function setLoggedOutCookies(cookies, app) {
  const loid = randomString(18);
  const loidcreated = (new Date()).toISOString();

  const options = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
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

export default setLoggedOutCookies;
