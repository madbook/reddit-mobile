import { collections, models, errors } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { OVERLAY_MENU_PARAMETER, COMMUNITY_MENU } from './overlayMenu';
import isFakeSubreddit from 'lib/isFakeSubreddit';

const { SubscribedSubreddits } = collections;
const { Subreddit } = models;
const { ResponseError } = errors;

export const FETCHING_SUBSCRIBED_SUBREDDITS = 'FETCHING_SUBSCRIBED_SUBREDDITS';
export const fetching = () => ({
  type: FETCHING_SUBSCRIBED_SUBREDDITS,
});

export const RECEIVED_SUBSCRIBED_SUBREDDITS = 'RECEIVED_SUBSCRIBED_SUBREDDITS';
export const received = apiResponse => ({
  type: RECEIVED_SUBSCRIBED_SUBREDDITS,
  apiResponse,
});

export const FETCH_FAILED = 'FETCH_FAILED_SUBSCRIBED_SUBREDDITS';
export const fetchFailed = error => ({
  type: FETCH_FAILED,
  error,
});

export const fetchSubscribedSubreddits = (onlyIfOverlay=false) => async (dispatch, getState) => {
  const state = getState();

  if (onlyIfOverlay) { // only fetch if we're rendering the overlay
    const { queryParams } = state.platform.currentPage;
    if (queryParams[OVERLAY_MENU_PARAMETER] !== COMMUNITY_MENU) {
      return;
    }
  }

  const { subscribedSubreddits } = state;
  if (subscribedSubreddits.fetching) { return; }

  dispatch(fetching());

  try {
    const subscribedCollection = await SubscribedSubreddits.fetch(apiOptionsFromState(state));
    dispatch(received(subscribedCollection.apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(fetchFailed(e));
    } else {
      throw e;
    }
  }
};

export const TOGGLED_SUBSCRIPTION = 'TOGGLED_SUBSCRIPTION';
export const toggled = (name, model) => ({
  type: TOGGLED_SUBSCRIPTION,
  name,
  model,
});

export const TOGGLE_FAILED = 'FAILED_TOGGLE_SUBSCRIPTION';
export const failedToggle = (name, error) => ({
  type: TOGGLE_FAILED,
  name,
  error,
});

export const toggleSubscription = ({ subredditName, fullName, isSubscriber }) => {
  // we take the fullName and isSubscriber so we don't have to make any api calls
  // on the server to lookup the subreddit;
  return async (dispatch, getState) => {
    if (isFakeSubreddit(subredditName)) { return; }

    const state = getState();
    let subreddit = state.subreddits[subredditName];
    if (!subreddit) {
      subreddit = Subreddit.fromJSON({ name: fullName, user_is_subscriber: isSubscriber });
    }

    // toggle the ui optomistically with the stub that returns from the api
    const stub = subreddit.toggleSubscribed(apiOptionsFromState(state));
    dispatch(toggled(subredditName, stub));

    try {
      const resolved = await stub.promise();
      dispatch(toggled(subredditName, resolved));
    } catch (e) {
      // update back to the old state since the api call failed
      dispatch(toggled(subredditName, subreddit));

      if (e instanceof ResponseError) {
        dispatch(failedToggle(subredditName, e));
      } else {
        throw e;
      }
    }
  };
};
