import merge from 'platform/merge';

import * as savedActions from 'app/actions/saved';
import { newSavedRequest } from 'app/models/SavedRequest';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case savedActions.FETCHING_SAVED: {
      const { id, params } = action;
      const request = state[id];
      if (request) { return state; }

      return merge(state, {
        [id]: newSavedRequest(id, params),
      });
    }

    case savedActions.RECEIVED_SAVED: {
      const { id, apiResponse } = action;
      const request = state[id];
      if (!request) { return state; }

      return merge(state, {
        [id]: { results: apiResponse.results, loading: false },
      });
    }

    default: return state;
  }
}
