import { endpoints } from '@r/api-client';
const { SavedEndpoint } = endpoints;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { paramsToSavedRequestId } from 'app/models/SavedRequest';

export const FETCHING_SAVED = 'FETCHING_SAVED';
export const fetching = (id, params) => ({ type: FETCHING_SAVED, id, params });

export const RECEIVED_SAVED = 'RECEIVED_SAVED';
export const received = (id, apiResponse) => ({ type: RECEIVED_SAVED, id, apiResponse });

export const fetch = params => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSavedRequestId(params);

  if (state.savedRequests[id]) { return; }

  dispatch(fetching(id, params));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await SavedEndpoint.get(apiOptions, params);
  dispatch(received(id, apiResponse));
};
