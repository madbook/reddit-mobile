import merge from '@r/platform/merge';
import * as searchActions from 'app/actions/search';
import * as loginActions from 'app/actions/login';

import { newSearchRequest } from 'app/models/SearchRequest';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case searchActions.FETCHING_SEARCH_REQUEST: {
      const { id, params } = action;
      const currentRequest = state[id];
      if (currentRequest) { return state; }

      return merge(state, {
        [id]: newSearchRequest(id, params),
      });
    }

    case searchActions.RECEIVED_SEARCH_REQUEST: {
      const { id, subreddits, posts } = action;
      const currentRequest = state[id];
      if (!currentRequest) { return state; }

      return merge(state, {
        [id]: {
          loading: false,
          subreddits,
          posts,
        },
      });
    }

    default: return state;
  }
};
