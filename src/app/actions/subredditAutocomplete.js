import { endpoints } from '@r/api-client';

import * as preferenceActions from 'app/actions/preferences';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';

const { SubredditAutocomplete } = endpoints;

export const FETCHING = 'AUTOCOMPLETE__FETCHING';
export const RECEIVED = 'AUTOCOMPLETE__RECEIVED';
export const RESET = 'AUTOCOMPLETE__RESET';

export const autocompleteFetch = query => ({ type: FETCHING, query });
export const autocompleteReceived = names => ({ type: RECEIVED, results: names });
export const resetAutocomplete = () => ({ type: RESET });

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
    dispatch(autocompleteFetch(searchTerm));

    const state = getState();
    const apiOptions = apiOptionsFromState(state);
    const { over18 } = state.preferences;

    const { names } = await takeLatest(
      SubredditAutocomplete.get(apiOptions, searchTerm, over18)
    );

    dispatch(autocompleteReceived(names));
  }, FIRE_EVERY);
};
