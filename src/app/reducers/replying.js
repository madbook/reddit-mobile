import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';

export const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case replyActions.SUCCESS:
    case replyActions.TOGGLE: {
      return merge(state, { [action.parentId]: !state[action.parentId] });
    }

    default: return state;
  }
}
