import merge from '@r/platform/merge';
import { models } from '@r/api-client';
import each from 'lodash/each';

import * as loginActions from 'app/actions/login';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import * as apiResponseActions from 'app/actions/apiResponse';
import { newSubscribedSubredditsModel } from 'app/models/SubscribedSubreddits';

const { SUBREDDIT } = models.ModelTypes;

const DEFAULT = newSubscribedSubredditsModel();

const updateStateFromSubreddits = (state, subreddits) => {
  const keys = Object.keys(subreddits);
  if (!keys.length) { return state; }

  const nextSubreddits = { ...state.subreddits };
  let changed = false;
  each(keys, key => {
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
      const { subscribedSubreddits } = action;
      const subreddits = {};

      each(subscribedSubreddits, subredditRecord => {
        subreddits[subredditRecord.uuid] = subredditRecord;
      });

      return merge(state, { subreddits, loaded: true });
    }

    // if theres any api response containing a subreddit and we've
    // already fetched all of the subscribed subreddits, update
    case apiResponseActions.RECEIVED_API_RESPONSE: {
      if (!state.loaded) { return state; }
      const { subreddits } = action.apiResponse;
      return updateStateFromSubreddits(state, subreddits);
    }

    case apiResponseActions.UPDATED_MODEL: {
      if (!state.loaded) { return state; }
      const { kind, model } = action;
      if (kind !== SUBREDDIT) { return state; }
      return updateStateFromSubreddits(state, { [model.uuid]: model });

    }

    default: return state;
  }
};
