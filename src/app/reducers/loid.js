import pick from 'lodash/pick';

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
      return pick(apiResponse.accounts.me, ['loid', 'loidCreated']);
    }
    default: return state;
  }
};
