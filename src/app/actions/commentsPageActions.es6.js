import APIOptions from '@r/api-client';
import { endpoints } from '@r/api-client'
import { paramsToCommentsPageId } from '../models/CommentsPageModel';
import { receivedResponse } from './apiResponseActions';

const { CommentsEndpoint } = endpoints;

export const FETCHING_COMMENTS_PAGE = 'FETCHING_COMMENTS_PAGE';

export const fetchingCommentsPage = (commentsPageId, commentsPageParams) => ({
  type: FETCHING_COMMENTS_PAGE,
  commentsPageId,
  commentsPageParams,
});

export const RECEIEVED_COMMENTS_PAGE = 'RECEIEVED_COMMENTS_PAGE';

export const receivedCommentsPage = (commentsPageId, commentsPageResults) => ({
  type: RECEIEVED_COMMENTS_PAGE,
  commentsPageId,
  commentsPageResults,
});

export const fetchCommentsPage = commentsPageParams => async (dispatch, getState) => {
  const state = getState();
  const commentsPageId = paramsToCommentsPageId(commentsPageParams);
  const commentsPage = state.commentsPages[commentsPageId];

  if (commentsPage) { return; }

  dispatch(fetchingCommentsPage(commentsPageId, commentsPageParams));

  // note that the comments endpoint returns the post, so we don't have to also
  // fetch that somewere else. it's in the api response so the apiResponseReducers
  // will automatically update the post slice of the store
  const apiResponse = await CommentsEndpoint.get(APIOptions, commentsPageParams);
  dispatch(receivedResponse(apiResponse));
  dispatch(receivedCommentsPage(commentsPageId, apiResponse.results));
}
