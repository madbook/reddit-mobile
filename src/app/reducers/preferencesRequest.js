import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as preferenceActions from 'app/actions/preferences';

export const DEFAULT = {
  succeeded: false,
  pending: false,
  failed: false,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case preferenceActions.FETCHING: {
      return merge(state, {
        pending: true,
        failed: false,
      });
    }

    case preferenceActions.RECEIEVED: {
      return merge(state, {
        pending: false,
        failed: false,
        succeeded: true,
      });
    }

    case preferenceActions.FETCH_FAILED: {
      return merge(state, {
        succeeded: false,
        pending: false,
        failed: true,
      });
    }

    default: return state;
  }
}
