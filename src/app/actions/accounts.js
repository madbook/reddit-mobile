import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints, errors } from '@r/api-client';
const { AccountsEndpoint } = endpoints;
const { ResponseError } = errors;

export const FETCHING_ACCOUNT = 'FETCHING_ACCOUNT';
// options is for the accounts endpoint, its properties are
// name: T.string.isRequired,
// loggedOut: T.bool, ( true if the user is loggedOut)
export const fetching = options => ({
  type: FETCHING_ACCOUNT,
  ...options,
});

export const RECEIVED_ACCOUNT = 'RECEIVED_ACCOUNT';
export const received = (options, apiResponse) => ({
  type: RECEIVED_ACCOUNT,
  ...options,
  apiResponse,
});

export const FAILED = 'FAILED_ACCOUNT';
export const failed = (options, error) => ({
  type: FAILED,
  options,
  error,
});

export const fetch = options => async (dispatch, getState) => {
  const { name, loggedOut } = options;
  const state = getState();
  const currentRequest = state.accountRequests[name];
  if (currentRequest) { return; }

  dispatch(fetching(options));
  const query = { user: name, loggedOut };

  try {
    const apiResponse = await AccountsEndpoint.get(apiOptionsFromState(state), query);
    dispatch(received(options, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(options, e));
    } else {
      throw e;
    }
  }
};
