import * as compactActions from 'app/actions/compact';

export const DEFAULT = false;

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case compactActions.SET_COMPACT: {
      return action.compact;
    }

    default: return state;
  }
};
