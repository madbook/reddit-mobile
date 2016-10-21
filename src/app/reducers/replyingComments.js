import merge from '@r/platform/merge';
import omit from 'lodash/omit';

import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case replyActions.REPLIED: {
      const { id } = action;

      if (state[id]) {
        return omit(state, id);
      }

      return state;
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
