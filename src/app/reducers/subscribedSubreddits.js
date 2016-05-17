import merge from '@r/platform/merge';
import { each } from 'lodash/collection';

import * as loginActions from 'app/actions/login';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import { newSubscribedSubredditsModel } from 'app/models/SubscribedSubreddits';


const DEFAULT = newSubscribedSubredditsModel();

export default(state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case subscribedSubredditsActions.FETCHING_SUBSCRIBED_SUBREDDITS: {
      if (state.fetching) { return state; }

      return merge(state, {
        fetching: true,
      });
    }

    case subscribedSubredditsActions.RECEIVED_SUBSCRIBED_SUBREDDITS: {
      const { subscribedSubreddits } = action;
      const subreddits = {};

      each(subscribedSubreddits, subredditRecord => {
        subreddits[subredditRecord.uuid] = subredditRecord;
      });

      return merge(state, { subreddits });
    }

    default: return state;
  }
};
