import * as loidActions from 'app/actions/loid';

export const DEFAULT = '';

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loidActions.SET_LOID: {
      if (typeof action.loid !== 'string') {
        return DEFAULT;
      }

      return action.loid;
    }

    default: return state;
  }
};
