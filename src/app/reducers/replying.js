import merge from '@r/platform/merge';
import * as replyActions from 'app/actions/reply';

export const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case replyActions.REPLYING: {
      return merge(state, {
        [action.id]: true,
      });
    }

    case replyActions.REPLIED: {
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    }
    default: return state;
  }
}
