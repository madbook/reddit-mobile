import merge from 'platform/merge';
import * as loginActions from 'app/actions/login';
import * as mailActions from 'app/actions/mail';

export const DEFAULT = [
  'messages',
  'comments',
  'selfreply',
  'mentions',
].reduce((dict, mailType) => ({
  ...dict,
  [mailType]: {
    pending: false,
    order: [],
    meta: {},
    error: null,
  },
}), {});

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case mailActions.FETCHING: {
      const { mailType } = action;
      return merge(state, {
        [mailType]: {
          pending: true,
          error: null,
        },
      });
    }
    case mailActions.RECEIVED: {
      const { mailType, apiResponse } = action;
      return merge(state, {
        [mailType]: {
          pending: false,
          error: null,
          order: apiResponse.results,
          meta: apiResponse.meta,
        },
      });
    }
    case mailActions.FAILED: {
      const { mailType, error } = action;
      return merge(state, {
        [mailType]: {
          error,
          pending: false,
        },
      });
    }
    default: return state;
  }
}
