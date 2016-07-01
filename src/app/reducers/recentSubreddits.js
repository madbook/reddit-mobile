import * as loginActions from 'app/actions/login';
import * as subredditActions from 'app/actions/subreddits';
import * as recentSubredditActions from 'app/actions/recentSubreddits';

const MAX_SUBREDDITS = 10;

const DEFAULT = [];

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case recentSubredditActions.SET_RECENT_SUBREDDITS: {
      return action.subreddits;
    }

    // TODO: this is causing a bug since this action is firing other times
    // other than visiting a subreddit (messing up the order)
    case subredditActions.RECEIVED_SUBREDDIT: {
      const { model: { displayName } } = action;
      // put new subreddit at the front and remove any duplicates
      const subreddits = [ displayName, ...state ];
      return Array.from(new Set(subreddits)).slice(0, MAX_SUBREDDITS);
    }

    default: {
      return state;
    }
  }
};
