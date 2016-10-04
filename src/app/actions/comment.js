import { endpoints, models, errors } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

const { SavedEndpoint, CommentsEndpoint, EditUserTextEndpoint } = endpoints;
const { ResponseError, ValidationError } = errors;


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

export const toggledCollapse = (id, collapse) => ({ type: TOGGLE_COLLAPSE, id, collapse });
export const toggleCollapse = (id, collapse) => async (dispatch) => {
  dispatch(toggledCollapse(id, collapse));
};

export const RESET_COLLAPSE = 'COMMENT__RESET_COLLAPSE';
export const resetCollapse = collapse => ({ type: RESET_COLLAPSE, collapse });

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
  const comment = state.comments[id];
  const method = comment.saved ? 'del' : 'post';
  await SavedEndpoint[method](apiOptionsFromState(state), { id });
  // the response doesn't have anything in it (yay api), so emit a new model
  // on the client side;
  const newComment = models.CommentModel.fromJSON({ ...comment.toJSON(), saved: !comment.saved });
  dispatch(saved(newComment));
};

export const del = id => async (dispatch, getState) => {
  const state = getState();
  const comment = state.comments[id];
  const apiOptions = apiOptionsFromState(state);
  await CommentsEndpoint.del(apiOptions, id);
  // the response doesn't have anything in it, so we're going to guess what the
  // comment should look like
  const newComment = models.CommentModel.fromJSON({
    ...comment.toJSON(),
    author: '[deleted]',
    bodyHTML: '[deleted]',
  });
  dispatch(deleted(newComment));
};

export const MORE_COMMENTS_FETCHING = 'COMMENTS__MORE_FETCHING';
export const MORE_COMMENTS_RECEIVED = 'COMMENTS__MORE_RECEIVED';
export const MORE_COMMENTS_FAILURE = 'COMMENTS__MORE_FAILURE';

export const fetching = parentCommentId => ({ parentCommentId, type: MORE_COMMENTS_FETCHING });
export const received = (parentCommentId, comments) => {
  return {
    comments,
    parentCommentId,
    type: MORE_COMMENTS_RECEIVED,
  };
};

export const failure = (parentCommentId, error) => {
  return {
    error,
    parentCommentId,
    type: MORE_COMMENTS_FAILURE,
  };
};

export const loadMore = comment => {
  return async (dispatch, getState) => {
    dispatch(fetching(comment.uuid));

    try {
      const resp = await CommentsEndpoint.get(apiOptionsFromState(getState()), {
        linkId: comment.linkId,
        commentIds: comment.loadMoreIds,
        sort: 'confidence',
      });

      // Doing this in here since doing it in api-client is messy. Since we
      // need to mix the current comment replies with the new, the `get` api
      // would need to accept the comment. This is tricky since that function
      // actually covers multiple endpoints and would need special handling of
      // the comment object.
      const newComment = comment.set({
        replies: [ ...comment.replies, ...resp.results ],
        loadMoreIds: [],
        loadMore: false,
      });

      dispatch(received(
        comment.uuid,
        { ...resp.comments, [newComment.uuid]: newComment },
      ));

    } catch (e) {
      if (e instanceof ResponseError) {
        dispatch(failure(e));
      } else {
        throw e;
      }
    }

  };
};
