import randomString from './randomString';

function setLoggedOutCookies(cookies, app) {
  let loid = randomString(18);
  let loidcreated = (new Date()).toISOString();

  var options = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };

  cookies.set('loid', loid, options);
  cookies.set('loidcreated', loidcreated, options);

  return {
    loid: loid,
    loidcreated: loidcreated,
    options: options,
  };
}

export default setLoggedOutCookies;