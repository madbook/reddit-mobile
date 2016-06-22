import { makeLocalStorageArchiver } from '@r/redux-state-archiver';

const collapsedSelector = state => state.collapsedComments;
const expandedSelector = state => state.expandedPosts;
const combiner = (collapsedComments, expandedPosts) => ({ collapsedComments, expandedPosts });

export const LocalStorageSync = makeLocalStorageArchiver(
  collapsedSelector,
  expandedSelector,
  combiner,
);
