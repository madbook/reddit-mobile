import * as themeActions from '../../app/actions/themeActions';
import { themes } from '../../app/constants';

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
};

export const dispatchInitialTheme = async (ctx, dispatch) => {
  const themeCookie = ctx.cookies.get('theme');
  const themeFromQuery = ctx.query.theme;
  let theme = themeFromQuery || themeCookie;

  if (!(theme === themes.NIGHTMODE || theme === themes.DAYMODE)) {
    theme = themes.DAYMODE;
  }

  if (theme !== themeCookie) {
    ctx.cookies.set('theme', theme, makeThemeCookieOptions());
  }

  dispatch(themeActions.setTheme(theme));
};
