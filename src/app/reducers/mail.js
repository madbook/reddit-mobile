import merge from '@r/platform/merge';

import * as mailActions from 'app/actions/mail';

const DEFAULT = [
  'messages',
  'comments',
  'selfreply',
  'mentions',
].reduce((dict, mailType) => ({
  ...dict,
  [mailType]: {
    pending: false,
    order: [],
    error: null,
  },
}), {});

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
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
        },
      });
    }
    case mailActions.FAILURE: {
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
