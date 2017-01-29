import merge from '@r/platform/merge';

import { POST, SUBREDDIT } from 'apiClient/models/thingTypes';
import * as searchActions from 'app/actions/search';
import * as loginActions from 'app/actions/login';
import { newSearchRequest } from 'app/models/SearchRequest';

const filtered = (records, type) => {
  return records.filter(r => r.type === type);
};

const subredditFilter = records => filtered(records, SUBREDDIT);
const postFilter = records => filtered(records, POST);

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
      const { id, apiResponse } = action;
      const currentRequest = state[id];
      if (!currentRequest) { return state; }

      const subreddits = subredditFilter(apiResponse.results);
      const posts = postFilter(apiResponse.results);

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
