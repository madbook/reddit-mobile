import merge from '@r/platform/merge';

import * as adActions from 'app/actions/ads';
import * as loginActions from 'app/actions/login';
import * as postsListActions from 'app/actions/postsList';

export const newPostsList = (id, params) => ({
  id,
  params,
  loading: true,
  adId: '',
  results: [],
});

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case postsListActions.FETCHING_POSTS_LIST: {
      const { postsListId, postsParams } = action;
      const currentPostsList = state[postsListId];
      if (currentPostsList) { return state; }

      return merge(state, {
        [postsListId]: newPostsList(postsListId, postsParams),
      });
    }

    case postsListActions.RECEIVED_POSTS_LIST: {
      const { postsListId, apiResponse } = action;
      const currentPostsList = state[postsListId];
      if (!currentPostsList) { return state; }

      return merge(state, {
        [postsListId]: {
          loading: false,
          results: apiResponse.results,
        },
      });
    }

    case adActions.FETCHING: {
      const { postsListId, adId } = action;
      return merge(state, {
        [postsListId]: {
          adId,
        },
      });
    }

    default: return state;
  }
};
