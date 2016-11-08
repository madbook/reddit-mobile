import has from 'lodash/has';

export default function getContentId(state) {
  // Use post ID for comments pages and comment permalinks
  if (has(state, ['platform', 'currentPage', 'urlParams', 'postId']) &&
      has(state, ['commentsPages', 'current'])) {
    // Vanilla comments page and comment permalink pages will have an entry in
    // state.commentsPages
    const commentsPage = state.commentsPages[state.commentsPages.current];
    return commentsPage.postId;
  }

  // Use the subreddit fullname for subreddit listings
  if (has(state, ['platform', 'currentPage', 'urlParams', 'subredditName'])) {
    const subreddit = state.platform.currentPage.urlParams.subredditName;
    if (subreddit) {
      return state.subreddits[subreddit].name;
    }
  }

  return null;
}
