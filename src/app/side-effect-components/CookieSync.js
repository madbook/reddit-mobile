import { makeCookieArchiver } from '@r/redux-state-archiver';

const themeSelector = state => state.theme;
const compactSelector = state => state.compact;
const over18Selector = state => state.user.preferences.over18;
const combiner = (theme, compact, over18) => ({ theme, compact, over18 });

export const CookieSync = makeCookieArchiver(
  themeSelector,
  compactSelector,
  over18Selector,
  combiner,
);
