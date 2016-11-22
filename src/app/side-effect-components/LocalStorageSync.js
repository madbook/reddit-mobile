import { makeLocalStorageArchiver } from '@r/redux-state-archiver';

const collapsedSelector = state => state.collapsedComments;
const expandedSelector = state => state.expandedPosts;
const visitedPostsSelector = state => JSON.stringify(state.visitedPosts);
const optOutsSelector = state => state.optOuts;

const combiner = (collapsedComments, expandedPosts, visitedPosts, optOuts) => ({
  collapsedComments,
  expandedPosts,
  visitedPosts,
  optOuts,
});

export default makeLocalStorageArchiver(
  collapsedSelector,
  expandedSelector,
  visitedPostsSelector,
  optOutsSelector,
  combiner,
);
