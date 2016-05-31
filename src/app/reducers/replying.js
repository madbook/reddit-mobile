import merge from '@r/platform/merge';
import * as commentActions from 'app/actions/comment';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case commentActions.REPLYING: {
      return merge(state, {
        [action.id]: true,
      });
    }

    case commentActions.REPLIED: {
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    }
    default: return state;
  }
}
