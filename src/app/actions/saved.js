import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { receivedResponse } from './apiResponse';
import { paramsToSavedRequestId } from 'app/models/SavedRequest';
import { endpoints } from '@r/api-client';
const { SavedEndpoint } = endpoints;

export const FETCHING_SAVED = 'FETCHING_SAVED';
export const fetching = (id, params) => ({ type: FETCHING_SAVED, id, params });

export const RECEIVED_SAVED = 'RECEIVED_SAVED';
export const received = (id, results) => ({ type: RECEIVED_SAVED, id, results });

export const fetch = params => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSavedRequestId(params);

  if (state.savedRequests[id]) { return; }

  dispatch(fetching(id, params));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await SavedEndpoint.get(apiOptions, params);
  dispatch(receivedResponse(apiResponse));
  dispatch(received(id, apiResponse.results));
};
