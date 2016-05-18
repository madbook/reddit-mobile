import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { receivedResponse } from './apiResponse';

const { AccountsEndpoint } = endpoints;

export const FETCHING_ACCOUNT = 'FETCHING_ACCOUNT';
export const fetching = (name) => ({ type: FETCHING_ACCOUNT, name });

export const RECEIEVED_ACCOUNT = 'RECEIEVED_ACCOUNT';
export const receieved = (name, result) => ({ type: RECEIEVED_ACCOUNT, name, result });

export const fetch = (name) => async (dispatch, getState) => {
  const state = getState();
  const currentRequest = state.accountRequests[name];
  if (currentRequest) { return; }

  dispatch(fetching(name));

  const apiResponse = await AccountsEndpoint.get(apiOptionsFromState(state), { user: name });
  dispatch(receivedResponse(apiResponse));

  const { results } = apiResponse;
  const result = results.length ? results[0] : {};
  dispatch(receieved(name, result));
};
