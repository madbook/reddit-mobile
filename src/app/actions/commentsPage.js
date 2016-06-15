import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';

const { CommentsEndpoint } = endpoints;

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
