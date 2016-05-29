import merge from '@r/platform/merge';
import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case commentActions.TOGGLE_COLLAPSE: {
      const collapse = action.collapse;

      return merge(state, {
        [action.id]: collapse,
      });
    }
    case commentActions.RESET_COLLAPSE: {
      return merge(state, { ...action.collapse });
    }
    default: return state;
  }
}
