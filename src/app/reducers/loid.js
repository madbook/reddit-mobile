import setCookieParser from 'set-cookie-parser';

import * as accountActions from 'app/actions/accounts';
import * as loidActions from 'app/actions/loid';

export const DEFAULT = {
  loid: '',
  loidCreated: '',
  loidCookie: '',
  loidCreatedCookie: '',
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loidActions.SET_LOID: {
      const { loid, loidCookie, loidCreated, loidCreatedCookie } = action;

      if (!loid) { return DEFAULT; }
      return { loid, loidCookie, loidCreated, loidCreatedCookie };
    }
    case accountActions.RECEIVED_ACCOUNT: {
      const { apiResponse } = action;
      if (apiResponse.accounts.me) {
        // We only want to use the loid/loidcreated values that come
        // back from the current user's account
        const { loid, loidCreated } = apiResponse.accounts.me;
        let newState = { ...state };

        if (loid) {
          newState = { ...newState, loid, loidCreated };
        }

        // If the server sent set-cookie headers, update the loid cookie values.
        // These are used to 'forward' loid cookies to server-side api calls,
        // so this ensures the api receives the most up-to-date value.
        const { meta } = apiResponse;
        const setCookieHeaders = meta['set-cookie'] || [];
        setCookieHeaders.forEach(setCookieHeader => {
          const { name, value } = setCookieParser.parse(setCookieHeader)[0];
          if (name === 'loid') {
            newState.loidCookie = value;
          } else if (name === 'loidcreated') {
            newState.loidCreatedCookie = value;
          }
        });

        return newState;
      }

      return state;
    }

    default: return state;
  }
};
