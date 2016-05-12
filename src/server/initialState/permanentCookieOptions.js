const COOKIE_OPTIONS = {
  httpOnly: false,
  overwrite: true,
  maxAge: 1000 * 60 * 60,
};

export const permanentCookieOptions =() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);

  return {
    ...COOKIE_OPTIONS,
    expires: date,
  };
};
