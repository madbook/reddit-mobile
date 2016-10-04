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

    case commentActions.TOGGLED_REPLY: {
      const reply = typeof action.reply === 'undefined' ? !state[action.id] : action.reply;

      return merge(state, {
        [action.id]: reply,
      });
    }

    case commentActions.RESET_REPLY: {
      return merge(state, { ...action.reply });
    }

    default: return state;
  }
}
