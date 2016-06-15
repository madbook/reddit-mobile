import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as searchActions from 'app/actions/search';
import * as subredditActions from 'app/actions/subreddits';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import { newSubscribedSubredditsModel } from 'app/models/SubscribedSubreddits';

const DEFAULT = newSubscribedSubredditsModel();

const updateStateFromSubreddits = (state, subreddits) => {
  const keys = Object.keys(subreddits);
  if (!keys.length) { return state; }

  const nextSubreddits = { ...state.subreddits };
  let changed = false;
  keys.forEach(key => {
    const subreddit = subreddits[key];
    if (!subreddit.userIsSubscriber && nextSubreddits[key]) {
      changed = true;
      delete nextSubreddits[key];
    } else if (subreddit.userIsSubscriber && !nextSubreddits[key]) {
      changed = true;
      nextSubreddits[key] = subreddit.toRecord();
    }
  });

  if (!changed) {
    return state; // don't update state if nothing changed;
  }

  return {
    ...state,
    subreddits: nextSubreddits,
  };
};

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
      const { apiResponse } = action;

      const subreddits = apiResponse.results.reduce((dict, subredditRecord) => ({
        ...dict,
        [subredditRecord.uuid]: subredditRecord,
      }), {});

      return merge(state, { subreddits, loaded: true });
    }

    // if theres any api response containing a subreddit and we've
    // already fetched all of the subscribed subreddits, update
    case searchActions.RECEIVED_SEARCH_REQUEST: {
      if (!state.loaded) { return state; }
      const { subreddits } = action.apiResponse;
      return updateStateFromSubreddits(state, subreddits);
    }

    case subredditActions.RECEIVED_SUBREDDIT:
    case subscribedSubredditsActions.TOGGLED_SUBSCRIPTION: {
      if (!state.loaded) { return state; }
      const { model } = action;
      return updateStateFromSubreddits(state, { [model.uuid]: model });

    }

    default: return state;
  }
};
