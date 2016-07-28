import * as loginActions from 'app/actions/login';
import * as scrollPositionActions from 'app/actions/scrollPosition';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case scrollPositionActions.SAVE_SCROLL_POSITION: {
      const { url, scrollTop } = action;
      return {
        ...state,
        [url]: scrollTop,
      };
    }

    default: {
      return state;
    }
  }
}
