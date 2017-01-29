import merge from 'platform/merge';

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

    case preferenceActions.PENDING: {
      return merge(state, {
        succeeded: false,
        pending: true,
        failed: false,
      });
    }

    case preferenceActions.RECEIVED: {
      return merge(state, {
        pending: false,
        succeeded: true,
      });
    }

    case preferenceActions.FAILED: {
      return merge(state, {
        pending: false,
        failed: true,
      });
    }

    default: return state;
  }
}
