import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToPostsListsId } from 'app/models/PostsList';

const { PostsEndpoint } = endpoints;

export const FETCHING_POSTS_LIST = 'FETCHING_POSTS_LIST';

export const fetching = (postsListId, postsParams) => ({
  type: FETCHING_POSTS_LIST,
  postsListId,
  postsParams,
});

export const RECEIVED_POSTS_LIST = 'RECEIVED_POSTS_LIST';

export const received = (postsListId, apiResponse) => ({
  type: RECEIVED_POSTS_LIST,
  postsListId,
  apiResponse,
});

export const fetchPostsFromSubreddit = postsParams => async (dispatch, getState) => {
  const state = getState();
  const postsListId = paramsToPostsListsId(postsParams);
  const postsList = state.postsLists[postsListId];

  if (postsList) { return; }

  dispatch(fetching(postsListId, postsParams));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await PostsEndpoint.get(apiOptions, postsParams);
  dispatch(received(postsListId, apiResponse));
};
