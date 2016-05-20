import merge from '@r/platform/merge';
import * as CommentActions from 'app/actions/comment';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case CommentActions.REPLYING: {
      return merge(state, {
        [action.id]: true,
      });
    }
    case CommentActions.REPLIED: {
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    }
    default: return state;
  }
}
