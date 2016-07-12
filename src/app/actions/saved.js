import { endpoints, errors } from '@r/api-client';
const { SavedEndpoint } = endpoints;
const { ResponseError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { paramsToSavedRequestId } from 'app/models/SavedRequest';

export const FETCHING_SAVED = 'FETCHING_SAVED';
export const fetching = (id, params) => ({
  type: FETCHING_SAVED,
  id,
  params,
});

export const RECEIVED_SAVED = 'RECEIVED_SAVED';
export const received = (id, apiResponse) => ({
  type: RECEIVED_SAVED,
  id,
  apiResponse,
});

export const FAILED = 'FAILED_SAVED';
export const failed = (id, error) => ({
  type: FAILED,
  id,
  error,
});

export const fetch = params => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSavedRequestId(params);

  if (state.savedRequests[id]) { return; }

  dispatch(fetching(id, params));

  try {
    const apiOptions = apiOptionsFromState(state);
    const apiResponse = await SavedEndpoint.get(apiOptions, params);
    dispatch(received(id, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(id, e));
    } else {
      throw e;
    }
  }
};
