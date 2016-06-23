import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';

const { PreferencesEndpoint } = endpoints;

export const FETCHING = 'FETCHING_PREFERENCES';
export const fetching = () => ({
  type: FETCHING,
});

export const RECEIEVED = 'RECEIEVED_PREFERENCES';
export const received = preferences => ({
  type: RECEIEVED,
  preferences,
});

export const FETCH_FAILED = 'FAILED_PREFERENCES_FETCH';
export const fetchFailed = error => ({
  type: FETCH_FAILED,
  error,
});

export const fetch = () => async (dispatch, getState) => {
  const state = getState();
  // don't fetch if we're already doing so or if we're not logged in
  const { preferencesRequest } = state;
  if (preferencesRequest.pending || preferencesRequest.succeeded) { return; }
  if (!state.session.accessToken) { return; }

  try {
    const preferences = await PreferencesEndpoint.get(apiOptionsFromState(state));
    dispatch(received(preferences));
  } catch (e) {
    dispatch(fetchFailed(e));
  }
};

export const patch = changes => async (dispatch, getState) => {
  const state = getState();
  const updatedPreferences = await PreferencesEndpoint.patch(apiOptionsFromState(state), changes);
  dispatch(received(updatedPreferences));
};

export const IS_OVER_18 = 'IS_OVER_18';
export const isOver18 = () => ({
  type: IS_OVER_18,
});

export const setOver18 = () => async (dispatch, getState) => {
  const state = getState();

  // if the user isn't logged in, dispatch the IS_OVER_18 action and let reducers
  // update the state appropriately
  if (!state.session.accessToken) {
    dispatch(isOver18());
    return;
  }

  try {
    await dispatch(patch({ over_18: true }));
  } catch (e) {
    // fallback to setting over 18 manually if the api call fails for somereason
    dispatch(isOver18());
  }
};
