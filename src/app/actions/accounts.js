import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';

const { AccountsEndpoint } = endpoints;

export const FETCHING_ACCOUNT = 'FETCHING_ACCOUNT';
export const fetching = options => ({ type: FETCHING_ACCOUNT, ...options });

export const RECEIVED_ACCOUNT = 'RECEIVED_ACCOUNT';
export const received = (options, apiResponse) => ({
  type: RECEIVED_ACCOUNT,
  ...options,
  apiResponse,
});

export const fetch = options => async (dispatch, getState) => {
  const { name, loggedOut } = options;
  const state = getState();
  const currentRequest = state.accountRequests[name];
  if (currentRequest) { return; }

  dispatch(fetching(options));
  const query = { user: name, loggedOut };

  const apiResponse = await AccountsEndpoint.get(apiOptionsFromState(state), query);
  dispatch(received(options, apiResponse));
};
