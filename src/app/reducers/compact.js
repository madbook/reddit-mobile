import * as compactActions from 'app/actions/compact';
import * as loginActions from 'app/actions/login';

export const DEFAULT = true;

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case compactActions.SET_COMPACT: {
      return action.compact;
    }

    default: return state;
  }
};
