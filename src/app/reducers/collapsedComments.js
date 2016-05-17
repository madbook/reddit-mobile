import merge from '@r/platform/merge';
import * as CommentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case CommentActions.TOGGLE_COLLAPSE: {
      const collapse = action.collapse;

      return merge(state, {
        [action.id]: collapse,
      });
    }
    case CommentActions.RESET_COLLAPSE: {
      return merge(state, { ...action.collapse });
    }
    default: return state;
  }
}
