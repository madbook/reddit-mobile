import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints, models } from '@r/api-client';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';
import { receivedResponse } from './apiResponse';

const { SearchEndpoint } = endpoints;

const { SUBREDDIT, POST } = models.ModelTypes;

const filtered = (records, type) => {
  return records.filter(r => r.type === type);
}

const subredditFilter = records => filtered(records, SUBREDDIT);
const postFilter = records => filtered(records, POST);

export const FETCHING_SEARCH_REQUEST = 'FETCHING_SEARCH_REQUEST';
export const fetching = (id, params) => ({
  type: FETCHING_SEARCH_REQUEST,
  id,
  params,
});

export const RECEIVED_SEARCH_REQUEST = 'RECEIVED_SEARCH_REQUEST';
export const received = (id, { subreddits, posts }) => ({
  type: RECEIVED_SEARCH_REQUEST,
  id,
  subreddits,
  posts,
});

export const search = searchParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSearchRequestId(searchParams);
  const currentRequest = state.searchRequests[id];

  if (currentRequest) { return; }

  dispatch(fetching(id, searchParams));

  const apiResponse = await SearchEndpoint.get(apiOptionsFromState(state), searchParams);
  dispatch(receivedResponse(apiResponse));

  const subreddits = subredditFilter(apiResponse.results);
  const posts = postFilter(apiResponse.results);

  dispatch(received(id, { subreddits, posts }));
};
