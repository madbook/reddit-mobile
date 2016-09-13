import config from '../config';

function setLoggedOutCookies(cookies, app, loid, loidcreated) {
  const options = {
    secure: app.getConfig('https'),
    secureProxy: app.getConfig('httpsProxy'),
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
  };

  if (app.config.origin.indexOf('localhost') === -1) {
    // We set the domain here to be `reddit.com` (for production reddit)
    options.domain = config.rootReddit;
  }

  cookies.set('loid', loid, options);
  cookies.set('loidcreated', loidcreated, options);

  return {
    loid,
    loidcreated,
    options,
  };
}

export default setLoggedOutCookies;
