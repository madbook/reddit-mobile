import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as postingActions from 'app/actions/posting';

const DEFAULT = {
  subreddit: '',
  title: '',
  meta: '',
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case postingActions.SUBREDDIT_SELECT: {
      return merge(state, { subreddit: action.subreddit });
    }

    case postingActions.FIELD_UPDATE: {
      const { field, value } = action;
      return merge(state, { [field]: value });
    }

    default:
      return state;
  }
};
