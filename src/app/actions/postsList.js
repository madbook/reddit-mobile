import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToPostsListsId } from '../models/PostsList';
import { receivedResponse } from './apiResponse';

import { last } from 'lodash/array';

const { PostsEndpoint } = endpoints;

export const FETCHING_POSTS_LIST = 'FETCHING_POSTS_LIST';

export const fetchingSubredditPosts = (postsListId, postsParams) => ({
  type: FETCHING_POSTS_LIST,
  postsListId,
  postsParams,
});

export const RECEIEVED_POSTS_LIST = 'RECEIEVED_POSTS_LIST';

export const recievedPostList = (postsListId, postsListResults) => ({
  type: RECEIEVED_POSTS_LIST,
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
  dispatch(recievedPostList(postsListId, apiResponse.results));
};

export const LOADING_MORE_POSTS = 'LOADING_MORE_POSTS';
export const loadingMorePosts = postsListId => ({
  type: LOADING_MORE_POSTS,
  postsListId,
});

export const RECEIEVED_MORE_POSTS = 'RECEIEVED_MORE_POSTS';
export const receievedMorePosts = (postsListId, postsListResults) => ({
  type: RECEIEVED_MORE_POSTS,
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
  dispatch(receievedMorePosts(postsListId, apiResponse.results));
};
