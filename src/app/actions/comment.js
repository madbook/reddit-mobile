import { apiOptionsFromState } from 'lib/apiOptionsFromState';

import CommentsEndpoint from 'apiClient/apis/CommentsEndpoint';
import CommentModel from 'apiClient/models/CommentModel';
import EditUserTextEndpoint from 'apiClient/apis/EditUserTextEndpoint';
import SavedEndpoint from 'apiClient/apis/SavedEndpoint';
import ResponseError from 'apiClient/errors/ResponseError';
import ValidationError from 'apiClient/errors/ValidationError';


export const TOGGLE_EDIT = 'COMMENT__TOGGLE_EDIT_FORM';
export const toggleEdit = commentId => ({
  type: TOGGLE_EDIT,
  thingId: commentId,
});

export const UPDATING_BODY = 'COMMENT__UPDATING_BODY';
export const updatingBody = commentId => ({
  type: UPDATING_BODY,
  thingId: commentId,
});

export const UPDATED_BODY = 'COMMENT__UPDATED_BODY';
export const updatedBody = comment => ({
  type: UPDATED_BODY,
  model: comment,
});

export const FAILED_UPDATE_BODY = 'COMMENT__FAILED_UPDATE_BODY';
export const failedUpdateBody = (commentId, error) => ({
  type: FAILED_UPDATE_BODY,
  thingId: commentId,
  error,
  message: 'Sorry, something went wrong with updating your comment',
});

export const updateBody = (commentId, newBodyText) => async (dispatch, getState) => {
  dispatch(updatingBody(commentId));

  const apiOptions = apiOptionsFromState(getState());

  try {
    const comment = await EditUserTextEndpoint.post(apiOptions, {
      thingId: commentId,
      text: newBodyText,
    });

    dispatch(updatedBody(comment));
  } catch (e) {
    if (e instanceof ValidationError || e instanceof ResponseError) {
      dispatch(failedUpdateBody(commentId, e));
    } else {
      throw e;
    }
  }
};

export const TOGGLE_COLLAPSE = 'COMMENT__TOGGLE_COLLAPSE';
export const toggleCollapse = id => ({
  type: TOGGLE_COLLAPSE,
  payload: { id },
});

export const SAVED = 'COMMENT__SAVED';
export const saved = comment => ({
  type: SAVED,
  comment,
});

export const DELETED = 'COMMENT__DELETED';
export const deleted = comment => ({
  type: DELETED,
  comment,
});

export const toggleSave = id => async (dispatch, getState) => {
  const state = getState();
  const comment = state.comments.data[id];
  const method = comment.saved ? 'del' : 'post';
  await SavedEndpoint[method](apiOptionsFromState(state), { id });
  // the response doesn't have anything in it (yay api), so emit a new model
  // on the client side;
  const newComment = CommentModel.fromJSON({ ...comment.toJSON(), saved: !comment.saved });
  dispatch(saved(newComment));
};

export const del = id => async (dispatch, getState) => {
  const state = getState();
  const comment = state.comments.data[id];
  const apiOptions = apiOptionsFromState(state);
  await CommentsEndpoint.del(apiOptions, id);
  // the response doesn't have anything in it, so we're going to guess what the
  // comment should look like
  const newComment = CommentModel.fromJSON({
    ...comment.toJSON(),
    author: '[deleted]',
    bodyHTML: '[deleted]',
  });
  dispatch(deleted(newComment));
};

export const MORE_COMMENTS_PENDING = 'COMMENTS__MORE_FETCHING';
export const MORE_COMMENTS_SUCCESS = 'COMMENTS__MORE_RECEIVED';
export const MORE_COMMENTS_FAILURE = 'COMMENTS__MORE_FAILURE';

export const pending = loadMoreId => ({
  payload: { loadMoreId },
  type: MORE_COMMENTS_PENDING,
});

export const success = (resp, pageId, loadMoreId) => {
  return {
    payload: {
      pageId,
      loadMoreId,
      ...resp,
    },
    type: MORE_COMMENTS_SUCCESS,
  };
};

export const failure = (loadMoreId, error) => {
  return {
    payload: {
      error,
      loadMoreId,
    },
    type: MORE_COMMENTS_FAILURE,
  };
};

export const loadMore = (loadMoreId, pageId, postId) => {
  return async (dispatch, getState) => {
    const loadMoreObject = getState().comments.loadMore[loadMoreId];
    const ids = loadMoreObject.children;
    dispatch(pending(loadMoreObject.uuid));

    try {
      const resp = await CommentsEndpoint.get(apiOptionsFromState(getState()), {
        linkId: postId,
        commentIds: ids,
        sort: 'confidence',
      });

      dispatch(success(resp, pageId, loadMoreId));

    } catch (e) {
      if (e instanceof ResponseError) {
        dispatch(failure(loadMoreId, e));
      } else {
        throw e;
      }
    }

  };
};
