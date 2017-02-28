import has from 'lodash/has';

export default function getContentId(state) {
  // Use post ID for comments pages and comment permalinks
  if (has(state, ['platform', 'currentPage', 'urlParams', 'postId']) &&
      has(state, ['commentsPages', 'data', 'current'])) {
    // Vanilla comments page and comment permalink pages will have an entry in
    // state.commentsPages
    const commentsPage = state.commentsPages.data[state.commentsPages.data.current];
    return commentsPage.postId;
  }

  // Use the subreddit fullname for subreddit listings
  if (has(state, ['platform', 'currentPage', 'urlParams', 'subredditName'])) {
    const subredditName = state.platform.currentPage.urlParams.subredditName;
    if (subredditName) {
      const subreddit = state.subreddits[subredditName.toLowerCase()];
      if (subreddit) {
        return subreddit.name;
      }
    }
  }

  return null;
}
