import config from 'config';

export const SESSION_COOKIES = [
  'token', // v1+ cookie
  'tokenExpires', // v1 only
  'refreshToken', // v1 only
];

export default ctx => {
  const rootOptions = { domain: config.rootReddit };

  SESSION_COOKIES.forEach(cookieName => {
    // clear the cookie and it's signed version for `m.reddit`
    ctx.cookies.set(cookieName);
    ctx.cookies.set(`${cookieName}.sig`);
    // clear the cookie and it's signed version from `.reddit`
    ctx.cookies.set(cookieName, undefined, rootOptions);
    ctx.cookies.set(`${cookieName}.sig`, undefined, rootOptions);
  });
};
