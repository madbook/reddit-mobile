import uniq from 'lodash/uniq';
import { makeCookieArchiver } from '@r/redux-state-archiver';
import { RECENT_CLICKS_LENGTH } from 'app/constants';

const recentClicksSelector = state => {
  const recentClicks = state.visitedPosts.concat(Object.keys(state.expandedPosts));
  return uniq(recentClicks).slice(0, RECENT_CLICKS_LENGTH);
};

const recentSubredditsSelector = state => {
  return state.recentSubreddits
    .filter(sub => state.subreddits[sub.toLowerCase()])
    .map(sub => state.subreddits[sub.toLowerCase()].name);
};

const combiner = (theme, compact, over18, recentSubreddits, recentClicks, username, euCookieNotice) => {
  const res = {
    theme,
    compact,
    over18,
    EUCookieNotice: euCookieNotice,
  };

  res[`${username}_recent_srs`] = recentSubreddits.join(',');
  res[`${username}_recentclicks2`] = recentClicks.map(post => `t3_${post}`).join(',');

  return res;
};

export default makeCookieArchiver(
  state => state.theme,
  state => state.compact,
  state => state.preferences.over18,
  recentSubredditsSelector,
  recentClicksSelector,
  state => !state.user.loggedOut && state.user.name ? state.user.name : '',
  state => state.euCookieNotice.numberOfTimesShown,
  combiner,
);
