import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case postActions.TOGGLE_EXPANDED: {
      const { postId } = action;
      const currentlyExpanded = state[postId];

      if (currentlyExpanded) {
        // Remove keys from state when it unexpands so there's less written to localStorage
        const nextState = { ...state };
        delete nextState[postId];
        return nextState;
      }

      return {
        ...state,
        [postId]: true,
      };
    }

    default: return state;
  }
}
