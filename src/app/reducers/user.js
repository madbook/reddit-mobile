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
      const { name } = action;
      if (name === 'me' && !state.loading) {
        return newUserModel({});
      }

      return state;
    }

    case accountActions.RECEIEVED_ACCOUNT: {
      const { name, result } = action;
      if (name === 'me' && result.uuid !== state.name) {
        return newUserModel({ name: result.uuid, loading: false });
      }

      return state;
    }

    default: return state;
  }
}
