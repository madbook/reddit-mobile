import merge from '@r/platform/merge';

import * as postsListActions from 'app/actions/postsList';
import * as loginActions from 'app/actions/login';
import { newPostsList } from 'app/models/PostsList';

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

    default: return state;
  }
};
