import { models } from '@r/api-client';

import mergeAPIModels from './helpers/mergeAPIModels';
import mergeUpdatedModel from './helpers/mergeUpdatedModel';
import * as loginActions from 'app/actions/login';
import * as searchActions from 'app/actions/search';
import * as subredditActions from 'app/actions/subreddits';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case searchActions.RECEIVED_SEARCH_REQUEST:
    case subscribedSubredditsActions.RECEIVED_SUBSCRIBED_SUBREDDITS: {
      const { subreddits } = action.apiResponse;
      return mergeAPIModels(state, subreddits);
    }

    case subredditActions.RECEIVED_SUBREDDIT:
    case subscribedSubredditsActions.TOGGLED_SUBSCRIPTION: {
      return mergeUpdatedModel(state, action);
    }

    default: return state;
  }
}
