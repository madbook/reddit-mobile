import { paramsToPostsListsId } from 'app/models/PostsList';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';
import PostsFromSubredditHandler from 'app/router/handlers/PostsFromSubreddit';

/**
 * Return the list of sticky posts from the active PostList based on state
 * @function
 * @param {Object} state
 * @returns {Object[]}
 */
export default function(state) {
  const { currentPage } = state.platform;
  const postsListParams = PostsFromSubredditHandler.pageParamsToSubredditPostsParams(currentPage);
  const postsListId = paramsToPostsListsId(postsListParams);
  if (!postsListId) { return []; }
  
  const activeList = state.postsLists[postsListId];
  if (!(activeList && activeList.results.length)) { return []; }

  const stickiedPosts = activeList.results.map(r => modelFromThingId(r.uuid, state))
                                          .filter(r => r.stickied);

  return stickiedPosts;
};
