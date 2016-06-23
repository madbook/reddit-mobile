import merge from '@r/platform/merge';

import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';
import * as preferenceActions from 'app/actions/preferences';

export const DEFAULT = {
  loggedOut: true,
  name: 'me',
  loading: false,
  features: {},
  preferences: {},
};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case accountActions.FETCHING_ACCOUNT: {
      const { name, loggedOut } = action;
      if (name === 'me' && !state.loading) {
        return merge(state, {
          name,
          loggedOut,
          loading: true,
        });
      }

      return state;
    }

    case accountActions.RECEIVED_ACCOUNT: {
      const { name, loggedOut, apiResponse } = action;
      const result = apiResponse.results.length ? apiResponse.results[0] : {};
      if (name === 'me' && result.uuid !== state.name) {
        return merge(state, {
          name: result.uuid,
          loading: false,
          loggedOut,
        });
      }

      return state;
    }

    case preferenceActions.RECEIEVED: {
      const { preferences } = action;
      return merge(state, {
        preferences,
      });
    }

    case preferenceActions.IS_OVER_18: {
      return merge(state, {
        preferences: {
          over18: true,
        },
      });
    }

    default: return state;
  }
}
