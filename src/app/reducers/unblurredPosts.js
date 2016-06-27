import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case postActions.TOGGLE_NSFW_BLUR: {
      const { postId } = action;
      const nextValue = !state[postId];

      return {
        ...state,
        [postId]: nextValue,
      };
    }

    default: return state;
  }
}
