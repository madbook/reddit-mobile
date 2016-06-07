import * as platformActions from '@r/platform/actions';

import * as recentSubredditActions from 'app/actions/recentSubreddits';

const DEFAULT = [];

// TODO: tests
// TODO: lowercase urls
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case recentSubredditActions.SET_RECENT_SUBREDDITS: {
      return action.subreddits;
    }

    case platformActions.SET_PAGE: {
      const { subredditName } = action.payload.urlParams;
      if (!subredditName) {
        return state;
      }
      return Array.from(new Set(state.concat(subredditName)));
    }

    default: {
      return state;
    }
  }
};
