import { makeLocalStorageArchiver } from '@r/redux-state-archiver';

const collapsedSelector = state => state.collapsedComments;
const expandedSelector = state => state.expandedPosts;
const visitedPostsSelector = state => JSON.stringify(state.visitedPosts);

const combiner = (collapsedComments, expandedPosts, visitedPosts) => ({
  collapsedComments,
  expandedPosts,
  visitedPosts,
});

export const LocalStorageSync = makeLocalStorageArchiver(
  collapsedSelector,
  expandedSelector,
  visitedPostsSelector,
  combiner,
);
