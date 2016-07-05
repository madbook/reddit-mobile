import { endpoints, models } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export const TOGGLE_EXPANDED = 'POSTS__TOGGLE_EXPANDED';
export const toggleExpanded = postId => ({
  type: TOGGLE_EXPANDED,
  postId,
});

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
    await endpoints.SavedEndpoint[method](apiOptions, { id: post.uuid });
    // the response doesn't actually give us anything back, so we'll just emit
    // a new model on the frontend if the call succeeeds.
    const newPost = models.PostModel.fromJSON({ ...post.toJSON(), saved: !post.saved });
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
    await endpoints.HiddenEndpoint[method](apiOptions, { id: post.uuid });
    // the response doesn't actually give us anything back, so we'll just emit
    // a new model on the frontend if the call succeeeds.
    const newPost = models.PostModel.fromJSON({ ...post.toJSON(), hidden: !post.hidden });
    dispatch(toggleHideReceived(newPost));
  } catch (e) {
    // TODO: handle these errors in the toaster
    console.error(e);
  }
};
