import { endpoints } from '@r/api-client';
const { HiddenEndpoint } = endpoints;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { receivedResponse } from './apiResponse';
import { paramsToHiddenRequestid } from 'app/models/HiddenRequest';

export const FETCHING_HIDDEN = 'FETCHING_HIDDEN';
export const fetching = (id, params) => ({ type: FETCHING_HIDDEN, id, params });

export const RECEIVED_HIDDEN = 'RECEIVED_HIDDEN';
export const received = (id, results) => ({ type: RECEIVED_HIDDEN, id, results });

export const fetch = params => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToHiddenRequestid(params);

  if (state.hiddenRequests[id]) { return; }

  dispatch(fetching(id, params));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await HiddenEndpoint.get(apiOptions, params);
  dispatch(receivedResponse(apiResponse));
  dispatch(received(id, apiResponse.results));
};
