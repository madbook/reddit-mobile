import SearchEndpoint from 'apiClient/apis/SearchEndpoint';
import ResponseError from 'apiClient/errors/ResponseError';

import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData } from 'lib/eventUtils';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';


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

    if (process.env.ENV === 'client') {
      const latestState = getState();
      getEventTracker().track('search_events', 'cs.search_executed', {
        ...getBasePayload(latestState),
        ...buildSubredditData(latestState),
        query_string_length: searchParams.q.length,
        interana_excluded: {
          query_string: searchParams.q,
        },
      });
    }

  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(id, e));
    } else {
      throw e;
    }
  }
};
