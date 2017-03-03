import some from 'lodash/some';

import CommentsEndpoint from 'apiClient/apis/CommentsEndpoint';
import PostsEndpoint from 'apiClient/apis/PostsEndpoint';
import ResponseError from 'apiClient/errors/ResponseError';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import getSubreddit from 'lib/getSubredditFromState';
import { cleanObject } from 'lib/cleanObject';
import features from 'app/featureFlags';

import { paramsToCommentsPageId } from 'app/models/CommentsPage';
import { paramsToPostsListsId } from 'app/models/PostsList';
import * as postListActions from 'app/actions/postsList';
import { flags } from 'app/constants';

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;

export const FETCHING_COMMENTS_PAGE = 'FETCHING_COMMENTS_PAGE';
export const fetching = (commentsPageId, commentsPageParams) => ({
  type: FETCHING_COMMENTS_PAGE,
  payload: {
    commentsPageId,
    commentsPageParams,
  },
});

export const RECEIVED_COMMENTS_PAGE = 'RECEIVED_COMMENTS_PAGE';
export const received = (commentsPageId, apiResponse) => ({
  type: RECEIVED_COMMENTS_PAGE,
  payload: {
    pageId: commentsPageId,
    ...apiResponse,
  },
});

export const FAILED = 'FAILED_COMMENTS_PAGE';
export const failed = (commentsPageId, error) => ({
  type: FAILED,
  payload: {
    commentsPageId,
    error,
  },
});

export const VISITED_COMMENTS_PAGE = 'VISITED_COMMENTS_PAGE';

export const visitedCommentsPage = (postId) => ({
  type: VISITED_COMMENTS_PAGE,
  postId,
});

export const fetchCommentsPage = commentsPageParams => async (dispatch, getState) => {
  const state = getState();
  const commentsPageId = paramsToCommentsPageId(commentsPageParams);
  const commentsPage = state.commentsPages.api[commentsPageId];

  if (commentsPage) { return; }

  dispatch(fetching(commentsPageId, commentsPageParams));

  // note that the comments endpoint returns the post, so we don't have to also
  // fetch that somewhere else. it's in the api response so the post's reducer will
  // will automatically update the post slice of the store
  try {
    const apiOptions = apiOptionsFromState(state);
    const apiResponse = await CommentsEndpoint.get(apiOptions, commentsPageParams);
    dispatch(received(commentsPageId, apiResponse));
  } catch (e) {
    dispatch(failed(commentsPageId, e));
  }
};

export function relevantContentPostsParams({ subredditName }) {
  return cleanObject({
    sort: 'hot',
    subredditName,
  });
}

export const fetchRelevantContent = () => {
  return async (dispatch, getState, { waitForState }) => {
    await waitForState(getSubreddit, async () => {
      const state = getState();
      const feature = features.withContext({ state });
      const subredditName = getSubreddit(state);
      if (some([VARIANT_NEXTCONTENT_BOTTOM], variant => feature.enabled(variant))) {
        const postsParams = relevantContentPostsParams({ subredditName });
        const postsListId = paramsToPostsListsId(postsParams);
        const postsList = state.postsLists[postsListId];

        if (postsList) { return; }

        dispatch(postListActions.fetching(postsListId, postsParams));
        const apiOptions = apiOptionsFromState(state);
        try {
          const apiResponse = await PostsEndpoint.get(apiOptions, postsParams);
          dispatch(postListActions.received(postsListId, apiResponse));
        } catch (e) {
          if (e instanceof ResponseError) {
            dispatch(postListActions.failed(postsListId, e));
          } else {
            throw e;
          }
        }
      }
    });
  };
};
