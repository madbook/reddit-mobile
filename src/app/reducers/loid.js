import * as accountActions from 'app/actions/accounts';
import * as loidActions from 'app/actions/loid';

export const DEFAULT = { loid: '', loidCreated: '' };

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loidActions.SET_LOID: {
      const { loid, loidCreated } = action;

      if (!loid) { return DEFAULT; }
      return { loid, loidCreated };
    }
    case accountActions.RECEIVED_ACCOUNT: {
      const { apiResponse } = action;
      if (apiResponse.accounts.me) {
        // We only want to use the loid/loidcreated values that come
        // back from the current user's account
        const { loid, loidCreated } = apiResponse.accounts.me;
        if (!loid) {
          return state;
        }

        return { loid, loidCreated };
      }

      return state;
    }

    default: return state;
  }
};
