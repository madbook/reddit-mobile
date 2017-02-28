export default function getSubreddit(state) {
  if (state.platform.currentPage.urlParams.subredditName) {
    return state.platform.currentPage.urlParams.subredditName;
  }

  const current = state.commentsPages.data.current;
  if (!current) {
    return null;
  }

  const currentResults = state.commentsPages.data[current];
  if (!currentResults || currentResults.length === 0) {
    return null;
  }

  const comment = state.comments.data[currentResults[0].uuid];
  if (!comment) {
    return null;
  }

  return comment.subreddit;
}
