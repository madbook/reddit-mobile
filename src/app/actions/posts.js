import { endpoints, models, errors } from '@r/api-client';
const { ResponseError, ValidationError } = errors;
const { SavedEndpoint, HiddenEndpoint, EditUserTextEndpoint } = endpoints;

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
    await SavedEndpoint[method](apiOptions, { id: post.uuid });
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
    await HiddenEndpoint[method](apiOptions, { id: post.uuid });
    // the response doesn't actually give us anything back, so we'll just emit
    // a new model on the frontend if the call succeeeds.
    const newPost = models.PostModel.fromJSON({ ...post.toJSON(), hidden: !post.hidden });
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
  message: 'Sorry, something went wrong with updating your post',
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
