import merge from '@r/platform/merge';
import * as modToolActions from 'app/actions/modTools';
import * as loginActions from 'app/actions/login';

const DEFAULT = {
  loading: false,
  error: null,
  names: null,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case modToolActions.FETCHING_MODERATING_SUBREDDITS: {
      const moderatingSubreddits = {
        loading: true,
        names: null,
        error: null,
      };
      return merge(state, moderatingSubreddits);
    }

    case modToolActions.RECEIVED_MODERATING_SUBREDDITS: {
      // example: ['pics', 'reddit']
      const moderatingSubredditNames = action.apiResponse.results.map(sr => sr.uuid);
      const moderatingSubreddits = {
        loading: false,
        names: moderatingSubredditNames,
        error: null,
      };
      return merge(state, moderatingSubreddits);
    }

    case modToolActions.FETCH_FAILED_MODERATING_SUBREDDITS: {
      const moderatingSubreddits = {
        loading: false,
        error: action.error,
        names: [],
      };
      return merge(state, moderatingSubreddits);
    }

    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    default: return state;
  }
}
