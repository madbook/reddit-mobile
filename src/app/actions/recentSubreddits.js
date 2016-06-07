export const SET_RECENT_SUBREDDITS = 'SET_RECENT_SUBREDDITS';

export const setRecentSubreddits = subreddits => ({
  subreddits,
  type: SET_RECENT_SUBREDDITS,
});
