import * as loidActions from 'app/actions/loid';

export const DEFAULT = { loid: '', loidcreated: '' };

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loidActions.SET_LOID: {
      const { loid, loidcreated } = action;
      if (typeof loid !== 'string') {
        return DEFAULT;
      }

      return { loid, loidcreated };
    }

    default: return state;
  }
};
