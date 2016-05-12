import merge from '@r/platform/merge';
import * as CommentActions from '../actions/comment';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
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
