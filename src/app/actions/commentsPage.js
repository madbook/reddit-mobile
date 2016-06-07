import { some } from 'lodash/collection';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import getSubreddit from 'lib/getSubredditFromState';
import { cleanObject } from 'lib/cleanObject';
import features from 'app/featureFlags';
import { endpoints } from '@r/api-client';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { fetching as fetchingPosts, received as receivedPosts } from 'app/actions/postsList';
import { flags } from 'app/constants';

const { CommentsEndpoint, PostsEndpoint } = endpoints;

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;

export const FETCHING_COMMENTS_PAGE = 'FETCHING_COMMENTS_PAGE';

export const fetchingCommentsPage = (commentsPageId, commentsPageParams) => ({
  type: FETCHING_COMMENTS_PAGE,
  commentsPageId,
  commentsPageParams,
});

export const RECEIVED_COMMENTS_PAGE = 'RECEIVED_COMMENTS_PAGE';

export const received = (commentsPageId, apiResponse) => ({
  type: RECEIVED_COMMENTS_PAGE,
  commentsPageId,
  apiResponse,
});

export const VISITED_COMMENTS_PAGE = 'VISITED_COMMENTS_PAGE';

export const visitedCommentsPage = (postId) => ({
  type: VISITED_COMMENTS_PAGE,
  postId,
});

export const fetchCommentsPage = commentsPageParams => async (dispatch, getState) => {
  const state = getState();
  const commentsPageId = paramsToCommentsPageId(commentsPageParams);
  const commentsPage = state.commentsPages[commentsPageId];

  if (commentsPage) { return; }

  dispatch(fetchingCommentsPage(commentsPageId, commentsPageParams));

  // note that the comments endpoint returns the post, so we don't have to also
  // fetch that somewere else. it's in the api response so the post's reducer will
  // will automatically update the post slice of the store
  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await CommentsEndpoint.get(apiOptions, commentsPageParams);
  dispatch(received(commentsPageId, apiResponse));
};

export function relevantContentPostsParams({ subredditName }) {
  return cleanObject({
    sort: 'hot',
    subredditName,
  });
}

export const fetchRelevantContent =
  () => async (dispatch, getState, { waitForState }) => {
    await waitForState(getSubreddit, async () => {
      const state = getState();
      const feature = features.withContext({ state });
      const subredditName = getSubreddit(state);
      if (some([VARIANT_NEXTCONTENT_BOTTOM], variant => feature.enabled(variant))) {
        const postsParams = relevantContentPostsParams({ subredditName });
        const postsListId = paramsToPostsListsId(postsParams);
        const postsList = state.postsLists[postsListId];

        if (postsList) { return; }

        dispatch(fetchingPosts(postsListId, postsParams));
        const apiOptions = apiOptionsFromState(state);
        const apiResponse = await PostsEndpoint.get(apiOptions, postsParams);
        dispatch(receivedPosts(postsListId, apiResponse));
      }
    });
  };
