import { endpoints, collections, errors } from '@r/api-client';
const { Modtools } = endpoints;
const { ModeratingSubreddits } = collections;
const { ResponseError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';
import stickyPostsFromState from 'app/reducers/helpers/stickyPostsFromState';

export const MODTOOLS_REMOVAL_PENDING = 'MODTOOLS_REMOVAL_PENDING';
export const MODTOOLS_REMOVAL_ERROR = 'MODTOOLS_REMOVAL_ERROR';
export const MODTOOLS_REMOVAL_SUCCESS = 'MODTOOLS_REMOVAL_SUCCESS';
export const MODTOOLS_APPROVAL_PENDING = 'MODTOOLS_APPROVAL_PENDING';
export const MODTOOLS_APPROVAL_ERROR = 'MODTOOLS_APPROVAL_ERROR';
export const MODTOOLS_APPROVAL_SUCCESS = 'MODTOOLS_APPROVAL_SUCCESS';
export const FETCHING_MODERATING_SUBREDDITS = 'FETCHING_MODERATING_SUBREDDITS';
export const RECEIVED_MODERATING_SUBREDDITS = 'RECEIVED_MODERATING_SUBREDDITS';
export const FETCH_FAILED_MODERATING_SUBREDDITS = 'FETCH_FAILED_MODERATING_SUBREDDITS';
export const MODTOOLS_SET_STICKY_POST_ERROR = 'MODTOOLS_SET_STICKY_POST_ERROR';
export const MODTOOLS_SET_STICKY_POST_PENDING = 'MODTOOLS_SET_STICKY_POST_PENDING';
export const MODTOOLS_SET_STICKY_POST_SUCCESS = 'MODTOOLS_SET_STICKY_POST_SUCCESS';

export const removalPending = spam => ({
  type: MODTOOLS_REMOVAL_PENDING,
  spam: spam,
});

export const removalError = spam => ({
  type: MODTOOLS_REMOVAL_ERROR,
  spam: spam,
});

export const removalSuccess = (spam, thing, username) => ({
  type: MODTOOLS_REMOVAL_SUCCESS,
  spam,
  thing,
  username,
});

export const approvalPending = () => ({
  type: MODTOOLS_APPROVAL_PENDING,
});

export const approvalError = () => ({
  type: MODTOOLS_APPROVAL_ERROR,
});

export const approvalSuccess = (thing, username) => ({
  type: MODTOOLS_APPROVAL_SUCCESS,
  thing,
  username,
});

export const fetchingSubs = () => ({
  type: FETCHING_MODERATING_SUBREDDITS,
});

export const receivedSubs = apiResponse => ({
  type: RECEIVED_MODERATING_SUBREDDITS,
  apiResponse,
});

export const fetchSubsFailed = error => ({
  type: FETCH_FAILED_MODERATING_SUBREDDITS,
  error,
});

const setStickyPostPending = () => ({
  type: MODTOOLS_SET_STICKY_POST_PENDING,
});

const setStickyPostError = () => ({
  type: MODTOOLS_SET_STICKY_POST_ERROR,
});

const setStickyPostSuccess = (thing, isStickied) => ({
  type: MODTOOLS_SET_STICKY_POST_SUCCESS,
  thing,
  isStickied,
});

export const remove = (id, spam) => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);
  const username = state.user.name;

  dispatch(removalPending(spam));

  try {
    await Modtools.remove(apiOptions, id, spam);
    dispatch(removalSuccess(spam, model, username));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(removalError(e));
    } else {
      throw e;
    }
  }
};

export const approve = id => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);
  const username = state.user.name;

  dispatch(approvalPending());

  try {
    await Modtools.approve(apiOptions, id);
    dispatch(approvalSuccess(model, username));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(approvalError(e));
    } else {
      throw e;
    }
  }
};

export const fetchModeratingSubreddits = () => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);

  const subredditsAlreadyFetched = (
    state.moderatingSubreddits.loading === true ||
    state.moderatingSubreddits.responseCode === 200);

  // don't make API call again
  if (subredditsAlreadyFetched) { return; }

  dispatch(fetchingSubs());

  try {
    const moderatingSubs = await ModeratingSubreddits.fetch(apiOptions);
    dispatch(receivedSubs(moderatingSubs.apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(fetchSubsFailed(e));
    } else {
      throw e;
    }
  }
};

/**
 * Sticky or unsticky a post (AKA an "Annoucement Post").
 * @function
 * @param {string} id The fullname of the post to sticky / unsticky
 * @param {boolean} isSettingSticky true if setting sticky, false if unsetting
 */
export const setStickyPost = (id, isSettingSticky) => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);

  dispatch(setStickyPostPending());

  try {
    await Modtools.setSubredditSticky(apiOptions, id, isSettingSticky);
    dispatch(setStickyPostSuccess(model, isSettingSticky));

    // If setting a sticky in a subreddit that already has two stickies, the
    // second existing sticky is replaced.  If we're viewing a listing, find
    // the second existing sticky and unsticky it.
    if (isSettingSticky) {
      const modelToUnsticky = stickyPostsFromState(state)[1];
      if (modelToUnsticky) {
        dispatch(setStickyPostSuccess(modelToUnsticky, false));
      }
    }
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(setStickyPostError(e));
    } else {
      throw e;
    }
  }
};
