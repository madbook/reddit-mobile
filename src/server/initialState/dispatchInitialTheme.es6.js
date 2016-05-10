import * as themeActions from '../../app/actions/themeActions';

export default async (ctx, dispatch, apiOptions) => {
  const themeCookie = ctx.cookies.get('theme');
  const themeFromQuery = ctx.query.theme;
  let theme = themeFromQuery || themeCookie;

  if (!(theme === themeActions.NIGHTMODE || theme == themeActions.DAYMODE)) {
    theme = themeActions.DAYMODE;
  }

  ctx.cookies.set('theme', theme);
  dispatch(themeActions.setTheme(theme));
};
