import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as subredditActions from 'app/actions/subreddits';
import { newSubredditRequest } from 'app/models/SubredditRequests';

export const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case subredditActions.FETCHING_SUBREDDIT: {
      const { name } = action;
      const currentRequest = state[name];
      if (currentRequest && currentRequest.loading) { return state; }

      return merge(state, {
        [name]: newSubredditRequest(name),
      });
    }

    case subredditActions.RECEIVED_SUBREDDIT: {
      const { name } = action;
      const currentRequest = state[name];
      if (!(currentRequest && currentRequest.loading)) { return state; }

      return merge(state, { [name]: { loading: false } });
    }

    case subredditActions.FAILED_SUBREDDIT: {
      const { name } = action;
      const currentRequest = state[name];
      if (!(currentRequest && currentRequest.loading)) { return state; }

      return merge(state, { [name]: { loading: false, failed: true } });
    }
    default: return state;
  }
};
