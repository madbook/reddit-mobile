import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import PreferencesEndpoint from 'apiClient/apis/PreferencesEndpoint';
import ResponseError from 'apiClient/errors/ResponseError';

export const PENDING = 'PENDING_PREFERENCES';
export const pending = () => ({
  type: PENDING,
});

export const RECEIVED = 'RECEIVED_PREFERENCES';
export const received = preferences => ({
  type: RECEIVED,
  preferences,
});

export const FAILED = 'FAILED_PREFERENCES';
export const failed = error => ({
  type: FAILED,
  error,
});

export const fetch = () => async (dispatch, getState) => {
  const state = getState();
  // don't fetch if we're already doing so or if we're not logged in
  const { preferencesRequest } = state;
  if (preferencesRequest.pending || preferencesRequest.succeeded) { return; }
  if (!state.session.accessToken) { return; }

  dispatch(pending());

  try {
    const preferences = await PreferencesEndpoint.get(apiOptionsFromState(state));
    dispatch(received(preferences));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(e));
    } else {
      throw e;
    }
  }
};

export const patch = changes => async (dispatch, getState) => {
  const state = getState();

  // In response to a `PATCH`, the PreferencesEndpoint returns the full
  // preferences model back to us, so we should use it to update state.
  // This means a `fetch` action doesn't have to fire because we're effectively
  // fetching already. However we don't block or return early because patch
  // writes, potentially new info, each time.
  dispatch(pending());

  try {
    const updatedPreferences = await PreferencesEndpoint.patch(
      apiOptionsFromState(state), changes);
    dispatch(received(updatedPreferences));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(e));
    } else {
      throw e;
    }
  }
};

export const IS_OVER_18 = 'IS_OVER_18';
export const isOver18 = () => ({
  type: IS_OVER_18,
});

export const setOver18 = () => async (dispatch, getState) => {
  const state = getState();

  // optimistically update over18. If the user is not logged in
  // we don't have to do anything else.
  dispatch(isOver18());

  if (!state.session.accessToken) {
    return;
  }

  // Otherwise we'll call patch so the real preferences object is updated
  dispatch(patch({ over_18: true }));
};
