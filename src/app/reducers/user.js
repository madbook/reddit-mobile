import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';
import { newUserModel } from 'app/models/User';

const DEFAULT = { loggedOut: true };

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case accountActions.FETCHING_ACCOUNT: {
      const { name, loggedOut } = action;
      if (name === 'me' && !state.loading) {
        return newUserModel({ loggedOut });
      }

      return state;
    }

    case accountActions.RECEIVED_ACCOUNT: {
      const { name, loggedOut, result } = action;
      if (name === 'me' && result.uuid !== state.name) {
        return newUserModel({ name: result.uuid, loading: false, loggedOut });
      }

      return state;
    }

    default: return state;
  }
}
