import { makeCookieArchiver } from '@r/redux-state-archiver';

const themeSelector = (state) => state.theme;
const compactSelector = (state) => state.compact;
const combiner = (theme, compact) => ({ theme, compact });

export const CookieSync = makeCookieArchiver(
  themeSelector,
  compactSelector,
  combiner,
);
