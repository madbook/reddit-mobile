import merge from 'platform/merge';
import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

const newAccountRequest = name => ({
  id: name,
  loading: true,
  failed: false,
  error: null,
});

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case accountActions.FETCHING_ACCOUNT: {
      const { name } = action;
      const request = state[name];
      if (request) { return state; }

      return merge(state, {
        [name]: newAccountRequest(name),
      });
    }

    case accountActions.RECEIVED_ACCOUNT: {
      const { name } = action;
      const request = state[name];
      if (!request) {
        return merge(state, {
          [name]: {
            ...newAccountRequest(name),
            loading: false,
          },
        });
      }

      return merge(state, {
        [name]: { loading: false },
      });
    }

    case accountActions.FAILED: {
      const { error, options: { name } } = action;

      return merge(state, {
        [name]: {
          error,
          loading: false,
          failed: true,
        },
      });
    }

    default: return state;
  }
}
