import ResponseError from 'apiClient/errors/ResponseError';
import ValidationError from 'apiClient/errors/ValidationError';
import SavedEndpoint from 'apiClient/apis/SavedEndpoint';
import HiddenEndpoint from 'apiClient/apis/HiddenEndpoint';
import EditUserTextEndpoint from 'apiClient/apis/EditUserTextEndpoint';
import PostModel from 'apiClient/models/PostModel';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

import { getEventTracker } from 'lib/eventTracker';
import {
  getBasePayload,
  buildSubredditData,
  getListingName,
  getUserInfoOrLoid,
} from 'lib/eventUtils';

export const TOGGLE_EXPANDED = 'POSTS__TOGGLE_EXPANDED';
export const toggleExpanded = postId => ({
  type: TOGGLE_EXPANDED,
  postId,
});

export const toggleExpandPost = (postId, clickTarget) => async (dispatch, getState) => {
  dispatch(toggleExpanded(postId));
  trackExpandToggle(getState(), postId, clickTarget);
};

function trackExpandToggle(state, postId, clickTarget) {
  const eventType = state.expandedPosts[postId] ? 'cs.expand_user' : 'cs.collapse_user';
  getEventTracker().track('expando_events', eventType, {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    ...getListingName(state),
    ...getPostInfo(state, postId),
    ...getUserInfoOrLoid(state),
    'click_target': clickTarget,
  });
}

function getPostInfo(state, postId) {
  const post = state.posts[postId];
  return {
    'target_author_id': post.id,
    'target_created_ts': post.createdUTC,
    'target_id': post.id,
    'target_fullname': post.name,
    'target_url_domain': post.domain,
    'target_url': post.cleanUrl,
    'target_type': post.isSelf ? 'self' : 'link',
    'nsfw': post.over18,
  };
}

export const TOGGLE_NSFW_BLUR = 'POSTS__TOGGLE_NSFW_BLUR';
export const toggleNSFWBlur = postId => ({
  type: TOGGLE_NSFW_BLUR,
  postId,
});

export const TOGGLE_SAVE_RECEIVED = 'POSTS__TOGGLE_SAVED_RECEIVED';
export const toggleSavedReceived = post => ({
  post,
  type: TOGGLE_SAVE_RECEIVED,
});

export const TOGGLE_HIDE_RECEIVED = 'POSTS__TOGGLE_HIDE_RECEIVED';
export const toggleHideReceived = post => ({
  post,
  type: TOGGLE_HIDE_RECEIVED,
});

export const toggleSavePost = postId => async (dispatch, getState) => {
  const state = getState();
  const post = state.posts[postId];
  const apiOptions = apiOptionsFromState(state);
  const method = post.saved ? 'del' : 'post';

  try {
    await SavedEndpoint[method](apiOptions, { id: post.uuid });
    // the response doesn't actually give us anything back, so we'll just emit
    // a new model on the frontend if the call succeeeds.
    const newPost = PostModel.fromJSON({ ...post.toJSON(), saved: !post.saved });
    dispatch(toggleSavedReceived(newPost));
  } catch (e) {
    // TODO: handle these errors in the toaster
    console.error(e);
  }
};

export const toggleHidePost = postId => async (dispatch, getState) => {
  const state = getState();
  const post = state.posts[postId];
  const apiOptions = apiOptionsFromState(state);
  const method = post.hidden ? 'del' : 'post';

  try {
    await HiddenEndpoint[method](apiOptions, { id: post.uuid });
    // the response doesn't actually give us anything back, so we'll just emit
    // a new model on the frontend if the call succeeeds.
    const newPost = PostModel.fromJSON({ ...post.toJSON(), hidden: !post.hidden });
    dispatch(toggleHideReceived(newPost));
  } catch (e) {
    // TODO: handle these errors in the toaster
    console.error(e);
  }
};

export const TOGGLE_EDIT = 'POSTS__TOGGLE_EDIT';
export const toggleEdit = postId => ({
  type: TOGGLE_EDIT,
  thingId: postId,
});

export const START_PLAYING = 'POSTS__START_PLAYING';
export const startPlaying = postId => ({
  type: START_PLAYING,
  thingId: postId,
});

export const STOP_PLAYING = 'POSTS__STOP_PLAYING';
export const stopPlaying = postId => ({
  type: STOP_PLAYING,
  thingId: postId,
});

export const UPDATING_SELF_TEXT = 'POSTS__UPDATING_SELF_TEXT';
export const updatingSelfText = postId => ({
  type: UPDATING_SELF_TEXT,
  thingId: postId,
});

export const UPDATED_SELF_TEXT = 'POSTS__UPDATED_SELF_TEXT';
export const updatedSelfText = post => ({
  type: UPDATED_SELF_TEXT,
  model: post,
});

export const FAILED_UPDATE_SELF_TEXT = 'POSTS__FAILED_UPDATE_SELF_TEXT';
export const failedUpdateSelfText = (postId, error) => ({
  type: FAILED_UPDATE_SELF_TEXT,
  thingId: postId,
  error,
  message: 'Sorry, something went wrong with updating your post.',
});

export const updateSelfText = (postId, newSelfText) => async (dispatch, getState) => {
  dispatch(updatingSelfText(postId));

  const apiOptions = apiOptionsFromState(getState());

  try {
    const post = await EditUserTextEndpoint.post(apiOptions, {
      thingId: postId,
      text: newSelfText,
    });

    dispatch(updatedSelfText(post));
  } catch (e) {
    if (e instanceof ValidationError || e instanceof ResponseError) {
      dispatch(failedUpdateSelfText(postId, e));
    } else {
      throw e;
    }
  }
};
