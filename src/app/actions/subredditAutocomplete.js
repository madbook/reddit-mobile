import * as preferenceActions from 'app/actions/preferences';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import SubredditAutocomplete from 'apiClient/apis/SubredditAutocomplete';
import ResponseError from 'apiClient/errors/ResponseError';


export const FETCHING = 'AUTOCOMPLETE__FETCHING';
export const fetching = query => ({
  type: FETCHING,
  query,
});

export const RECEIVED = 'AUTOCOMPLETE__RECEIVED';
export const received = names => ({
  type: RECEIVED,
  results: names,
});

export const RESET = 'AUTOCOMPLETE__RESET';
export const reset = () => ({
  type: RESET,
});


export const FAILED = 'AUTOCOMPLETE__FAILED';
export const failedAutocomplete = error => ({
  type: FAILED,
  error,
});

/**
 * Only resolve the latest promise in and "discard" any un-resolved promises.
 *
 * @param {Promise} promise
 * @returns {Promise}
 */
let latestPromise;
function takeLatest(promise) {
  latestPromise = promise;

  return new Promise((resolve, reject) => {
    promise.then(val => {
      if (promise === latestPromise) {
        resolve(val);
      }
    });

    promise.catch(err => {
      if (promise === latestPromise) {
        reject(err);
      }
    });
  });
}

let timeout;
const FIRE_EVERY = 250;
export const fetch = searchTerm => async (dispatch, getState) => {
  // Ensure preferences are available. This only fires once since fetch checks
  // for the request's state
  await dispatch(preferenceActions.fetch());

  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    dispatch(fetching(searchTerm));

    const state = getState();
    const apiOptions = apiOptionsFromState(state);
    const { over18 } = state.preferences;

    try {
      const { names } = await takeLatest(
        SubredditAutocomplete.get(apiOptions, searchTerm, over18)
      );

      dispatch(received(names));
    } catch (e) {
      if (e instanceof ResponseError) {
        dispatch(failedAutocomplete(e));
      } else {
        throw e;
      }
    }
  }, FIRE_EVERY);
};
