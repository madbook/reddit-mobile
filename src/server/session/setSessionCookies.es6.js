const COOKIE_OPTIONS = {
  // signed: true,
  httpOnly: false,
  overwrite: true,
  maxAge: 1000 * 60 * 60,
};

export default (ctx, session) => {
  ctx.cookies.set('token', session.tokenString, {
    ...COOKIE_OPTIONS,
    expires: session.expires,
    maxAge: session.expires * 1000,
  });
}
