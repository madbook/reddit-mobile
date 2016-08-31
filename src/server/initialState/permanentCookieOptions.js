import config from 'config';

export const permanentCookieOptions = () => {
  const secure = config.https || config.httpsProxy;

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 2);

  return {
    secure,
    httpOnly: !secure,
    expires,
  };
};
