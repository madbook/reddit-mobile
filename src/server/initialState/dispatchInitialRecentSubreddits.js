import * as recentSubredditActions from 'app/actions/recentSubreddits';

export const dispatchInitialRecentSubreddits = (ctx, dispatch) => {
  const recentSubredditsCookie = ctx.cookies.get('recentSubreddits');

  let recentSubreddits;
  try {
    // handle missing or badly set cookie
    recentSubreddits = JSON.parse(decodeURIComponent(recentSubredditsCookie));
  } catch (e) {
    recentSubreddits = [];
  }

  dispatch(recentSubredditActions.setRecentSubreddits(recentSubreddits));
};
