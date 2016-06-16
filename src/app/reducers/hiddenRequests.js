import merge from '@r/platform/merge';

import * as hiddenActions from 'app/actions/hidden';
import { newHiddenRequest } from 'app/models/HiddenRequest';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case hiddenActions.FETCHING_HIDDEN: {
      const { id, params } = action;
      const request = state[id];
      if (request) { return state; }

      return merge(state, {
        [id]: newHiddenRequest(id, params),
      });
    }

    case hiddenActions.RECEIVED_HIDDEN: {
      const { id, results } = action;
      const request = state[id];
      if (!request) { return state; }

      return merge(state, {
        [id]: { results, loading: false },
      });
    }

    default: return state;
  }
}
