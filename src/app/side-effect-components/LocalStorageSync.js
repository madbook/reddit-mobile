import { makeLocalStorageArchiver } from './StateArchiver';

export default makeLocalStorageArchiver(
  state => state.comments.collapsed,
  state => state.expandedPosts,
  state => JSON.stringify(state.visitedPosts),
  state => state.optOuts,
  state => state.rulesModal,
  (collapsedComments, expandedPosts, visitedPosts, optOuts, rulesModal) => ({
    collapsedComments,
    expandedPosts,
    visitedPosts,
    optOuts,
    rulesModal,
  }),
);
