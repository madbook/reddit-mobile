import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints, errors } from '@r/api-client';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';

const { SearchEndpoint } = endpoints;
const { ResponseError } = errors;

export const FETCHING_SEARCH_REQUEST = 'FETCHING_SEARCH_REQUEST';
export const fetching = (id, params) => ({
  type: FETCHING_SEARCH_REQUEST,
  id,
  params,
});

export const RECEIVED_SEARCH_REQUEST = 'RECEIVED_SEARCH_REQUEST';
export const received = (id, apiResponse) => ({
  type: RECEIVED_SEARCH_REQUEST,
  id,
  apiResponse,
});

export const FAILED = 'FAILED_SEARCH_REQUEST';
export const failed = (id, error) => ({
  type: FAILED,
  id,
  error,
});

export const search = searchParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSearchRequestId(searchParams);
  const currentRequest = state.searchRequests[id];

  if (currentRequest) { return; }

  dispatch(fetching(id, searchParams));

  try {
    const apiResponse = await SearchEndpoint.get(apiOptionsFromState(state), searchParams);
    dispatch(received(id, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(id, e));
    } else {
      throw e;
    }
  }
};
