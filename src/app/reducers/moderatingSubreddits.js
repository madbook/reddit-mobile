import merge from '@r/platform/merge';
import * as modToolActions from 'app/actions/modTools';
import * as loginActions from 'app/actions/login';

const DEFAULT = {
  loading: false,
  responseCode: null,
  names: [],
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case modToolActions.FETCHING_MODERATING_SUBREDDITS: {
      const moderatingSubreddits = {
        loading: true,
        responseCode: null,
        names: [],
      };
      return merge(state, moderatingSubreddits);
    }

    case modToolActions.RECEIVED_MODERATING_SUBREDDITS: {
      // example: ['pics', 'reddit']
      const moderatingSubredditNames = action.apiResponse.results.map(sr => sr.uuid);
      const moderatingSubreddits = {
        loading: false,
        responseCode: action.apiResponse.response.status,
        names: moderatingSubredditNames,
      };
      return merge(state, moderatingSubreddits);
    }

    case modToolActions.FETCH_FAILED_MODERATING_SUBREDDITS: {
      const moderatingSubreddits = {
        loading: false,
        responseCode: action.error.status,
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
