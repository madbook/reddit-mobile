import * as themeActions from '../../app/actions/theme';
import { themes } from '../../app/constants';
import { DEFAULT } from '../../app/reducers/theme';
import { permanentCookieOptions } from './permanentCookieOptions';

export const dispatchInitialTheme = async (ctx, dispatch) => {
  const themeCookie = ctx.cookies.get('theme');
  const themeFromQuery = ctx.query.theme;
  let theme = themeFromQuery || themeCookie;

  if (!(theme === themes.NIGHTMODE || theme === themes.DAYMODE)) {
    theme = DEFAULT;
  }

  if (theme !== themeCookie) {
    ctx.cookies.set('theme', theme, permanentCookieOptions());
  }

  dispatch(themeActions.setTheme(theme));
};
