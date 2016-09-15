import config from 'config';

export const permanentCookieOptions = () => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 2);

  return {
    secure: config.https,
    secureProxy: config.httpsProxy, // NOTE: this flag is deprecated by the
    // cookies module used by Koa, so we have to be careful about upgrading.
    // `secureProxy` says that its okay for cookies to be sent with the 'secure'
    // flag, which is intended for https cookies. The idea is to set `secureProxy`
    // when you have proxy or load balancer that isn't over HTTPS between your
    // user and app-server, because the `secure` flag will throw Error objects
    // if the app-server's request isn't https.
    // In theory, now that it's deprecated, we should be passing `secure: true`
    // to the `new Cookies({})` constructor, but that's called by `Koa`
    // so we'll have to fork/pull-request that in the future.
    httpOnly: true, // This flag isn't what you think it means. It tells
    // browsers to not expose these headers to XMLHTTPRequestss, but still
    // set the cookies
    expires,
  };
};
