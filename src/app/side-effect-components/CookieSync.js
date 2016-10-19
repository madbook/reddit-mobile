import { makeCookieArchiver } from '@r/redux-state-archiver';

export default makeCookieArchiver(
  state => state.theme,
  state => state.compact,
  state => state.preferences.over18,
  state => state.recentSubreddits,
  state => state.euCookieNotice.numberOfTimesShown,
  (theme, compact, over18, recentSubreddits, euCookieNotice) => ({
    theme,
    compact,
    over18,
    recentSubreddits,
    EUCookieNotice: euCookieNotice, // legacy cookie from 1X, need have the correct casing
  })
);
