import { models } from '@r/api-client';
import * as platformActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import * as subredditActions from './subreddits';

const { Subreddit } = models;

const gotoSubredditPage = (subredditName, dispatch) => {
  dispatch(platformActions.navigateToUrl(METHODS.GET, `/r/${subredditName}`, {}));
};

const subredditExists = (subredditName, state) => {
  return !!state.subreddits[subredditName];
};

export const gotoSubreddit = (queriedName, waitForAction) => async (dispatch, getState) => {
  const name = Subreddit.cleanName(queriedName);

  if (subredditExists(name, getState())) {
    gotoSubredditPage(name, dispatch);
    return;
  }

  dispatch(subredditActions.fetchSubreddit(name));

  await waitForAction(
    (action) => action.type === subredditActions.RECEIEVED_SUBREDDIT && action.name === name,
  );

  if (subredditExists(name, getState())) {
    gotoSubredditPage(name, dispatch);
    return;
  }

  let query = queriedName;

  if (query.indexOf('/') !== -1) {
    query = query.location.split('/')[1];
  }

  const queryParams = { q: query };

  dispatch(platformActions.navigateToUrl(METHODS.GET, '/search', { queryParams }));
};
