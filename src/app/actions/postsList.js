import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { receivedResponse } from './apiResponse';

import last from 'lodash/last';

const { PostsEndpoint } = endpoints;

export const FETCHING_POSTS_LIST = 'FETCHING_POSTS_LIST';

export const fetchingSubredditPosts = (postsListId, postsParams) => ({
  type: FETCHING_POSTS_LIST,
  postsListId,
  postsParams,
});

export const RECEIVED_POSTS_LIST = 'RECEIVED_POSTS_LIST';

export const receivedPostList = (postsListId, postsListResults) => ({
  type: RECEIVED_POSTS_LIST,
  postsListId,
  postsListResults,
});

export const fetchPostsFromSubreddit = postsParams => async (dispatch, getState) => {
  const state = getState();
  const postsListId = paramsToPostsListsId(postsParams);
  const postsList = state.postsLists[postsListId];

  if (postsList) { return; }

  dispatch(fetchingSubredditPosts(postsListId, postsParams));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await PostsEndpoint.get(apiOptions, postsParams);
  dispatch(receivedResponse(apiResponse));
  dispatch(receivedPostList(postsListId, apiResponse.results));
};

export const LOADING_MORE_POSTS = 'LOADING_MORE_POSTS';
export const loadingMorePosts = postsListId => ({
  type: LOADING_MORE_POSTS,
  postsListId,
});

export const RECEIVED_MORE_POSTS = 'RECEIVED_MORE_POSTS';
export const receivedMorePosts = (postsListId, postsListResults) => ({
  type: RECEIVED_MORE_POSTS,
  postsListId,
  postsListResults,
});

export const addMorePostsFromSubreddit = postsParams => async (dispatch, getState) => {
  const state = getState();
  const postsListId = paramsToPostsListsId(postsParams);
  const postsList = state.postsLists[postsListId];
  if (!postsList || postsList.loadingMore) { return; }

  dispatch(loadingMorePosts(postsListId));

  const after = last(postsList.results).uuid;
  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await PostsEndpoint.get(apiOptions, { ...postsParams, after});
  dispatch(receivedResponse(apiResponse));
  dispatch(receivedMorePosts(postsListId, apiResponse.results));
};
