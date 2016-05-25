import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { receivedResponse } from './apiResponse';

const { AccountsEndpoint } = endpoints;

export const FETCHING_ACCOUNT = 'FETCHING_ACCOUNT';
export const fetching = (options) => ({ type: FETCHING_ACCOUNT, ...options });

export const RECEIVED_ACCOUNT = 'RECEIVED_ACCOUNT';
export const received = (options, result) => ({ type: RECEIVED_ACCOUNT, ...options, result });

export const fetch = (options) => async (dispatch, getState) => {
  const { name, loggedOut } = options;
  const state = getState();
  const currentRequest = state.accountRequests[name];
  if (currentRequest) { return; }

  dispatch(fetching(options));
  const query = { user: name, loggedOut };

  const apiResponse = await AccountsEndpoint.get(apiOptionsFromState(state), query);
  dispatch(receivedResponse(apiResponse));

  const { results } = apiResponse;
  const result = results.length ? results[0] : {};
  dispatch(received(options, result));
};
