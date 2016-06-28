import { models } from '@r/api-client';
const { Preferences } = models;

import * as loginActions from 'app/actions/login';
import * as preferenceActions from 'app/actions/preferences';

// state will be an instance of the Preferences object so we can call
// .set on it, even if the user isn't logged in or the request to fetch
// them initially failed
export const DEFAULT = Preferences.fromJSON({});

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case preferenceActions.RECEIVED: {
      const { preferences } = action;
      return preferences;
    }

    case preferenceActions.IS_OVER_18: {
      return state.set('over18', true);
    }

    default: return state;
  }
}
