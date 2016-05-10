import * as themeActions from '../../app/actions/themeActions';

const COOKIE_OPTIONS = {
  httpOnly: false,
  overwrite: true,
  maxAge: 1000 * 60 * 60,
};

const makeThemeCookieOptions = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);

  return {
    ...COOKIE_OPTIONS,
    expires: date,
  };
}


export default async (ctx, dispatch, apiOptions) => {
  const themeCookie = ctx.cookies.get('theme');
  const themeFromQuery = ctx.query.theme;
  let theme = themeFromQuery || themeCookie;

  if (!(theme === themeActions.NIGHTMODE || theme == themeActions.DAYMODE)) {
    theme = themeActions.DAYMODE;
  }

  ctx.cookies.set('theme', theme, makeThemeCookieOptions());
  dispatch(themeActions.setTheme(theme));
};
