import { endpoints, models } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export const TOGGLE_EDIT_FORM = 'COMMENT__TOGGLE_EDIT_FORM';
export const toggleEditForm = id => ({ type: TOGGLE_EDIT_FORM, id });

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
  await endpoints.SavedEndpoint[method](apiOptionsFromState(state), { id });
  // the response doesn't have anything in it (yay api), so emit a new model
  // on the client side;
  const newComment = models.CommentModel.fromJSON({ ...comment.toJSON(), saved: !comment.saved });
  dispatch(saved(newComment));
};

export const del = id => async (dispatch, getState) => {
  const state = getState();
  const comment = state.comments[id];
  const apiOptions = apiOptionsFromState(state);
  await endpoints.CommentsEndpoint.del(apiOptions, id);
  // the response doesn't have anything in it, so we're going to guess what the
  // comment should look like
  const newComment = models.CommentModel.fromJSON({
    ...comment.toJSON(),
    author: '[deleted]',
    bodyHTML: '[deleted]',
  });
  dispatch(deleted(newComment));
};

export const REPORTING = 'REPORTING';
export const REPORTED = 'REPORTED';
export const report = (id, reason) => async (dispatch, getState) => {
  console.log(id, reason, getState());
};

export const LOADING_MORE = 'LOADING_MORE';
export const LOADED_MORE = 'LOADED_MORE';
export const loadMore = ids => async (dispatch, getState) => {
  console.log(ids, getState());
};
