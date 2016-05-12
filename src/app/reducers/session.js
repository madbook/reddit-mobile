import * as sessionActions from 'app/actions/session';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case sessionActions.SET_SESSION: {
      const { session } = action.payload;
      return session;
    }
    default: return state;
  }
}
