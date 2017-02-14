import has from 'lodash/has';

export default function getSubreddit(state) {
  if (state.platform.currentPage.urlParams.subredditName) {
    return state.platform.currentPage.urlParams.subredditName;
  }

  if (!has(state, ['commentsPages', 'current'])) {
    return null;
  }

  const current = state.commentsPages.current;
  if (!has(state, ['commentsPages', current, 'results'])) {
    return null;
  }

  const results = state.commentsPages[current].results;
  if (results.length === 0) {
    return null;
  }

  const comment = state.comments[results[0].uuid];
  if (!comment) {
    return null;
  }

  return comment.subreddit;
}
