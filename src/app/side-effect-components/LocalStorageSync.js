import { makeLocalStorageArchiver } from './StateArchiver';

export default makeLocalStorageArchiver(
  state => state.comments.collapsed,
  state => state.expandedPosts,
  state => JSON.stringify(state.visitedPosts),
  state => state.optOuts,
  (collapsedComments, expandedPosts, visitedPosts, optOuts) => ({
    collapsedComments,
    expandedPosts,
    visitedPosts,
    optOuts,
  }),
);
