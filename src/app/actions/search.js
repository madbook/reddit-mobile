import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';

const { SearchEndpoint } = endpoints;

export const FETCHING_SEARCH_REQUEST = 'FETCHING_SEARCH_REQUEST';
export const fetching = (id, params) => ({
  type: FETCHING_SEARCH_REQUEST,
  id,
  params,
});

export const RECEIVED_SEARCH_REQUEST = 'RECEIVED_SEARCH_REQUEST';
export const received = (id, apiResponse) => ({ type: RECEIVED_SEARCH_REQUEST, id, apiResponse });

export const search = searchParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSearchRequestId(searchParams);
  const currentRequest = state.searchRequests[id];

  if (currentRequest) { return; }

  dispatch(fetching(id, searchParams));

  const apiResponse = await SearchEndpoint.get(apiOptionsFromState(state), searchParams);
  dispatch(received(id, apiResponse));
};
