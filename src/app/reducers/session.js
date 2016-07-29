import * as sessionActions from 'app/actions/session';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case sessionActions.SET_SESSION: {
      const { session } = action.payload;
      return session;
    }
    case sessionActions.SESSION_ERROR: {
      // In the case of an error, we return an object with just that.
      // These allows three states: 1) logged in, 2) logged out with no error
      // and 3) logged out with an error (which can be cleared by sending null)
      const { error } = action.payload;
      return { error };
    }
    default: return state;
  }
}
