// replies are technically comments. _but_ its an action taken on a post or comment.
// Thus all actions related to replying, opening the form, and making the reply
// are kept in this file.

import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData, convertId } from 'lib/eventUtils';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';


export const TOGGLE = 'REPLY__TOGGLE';
export const SUCCESS = 'REPLY__SUCCESS';
export const FAILURE = 'REPLY__FAILURE';

export const toggle = parentId => ({ type: TOGGLE, parentId });
export const success = (parentId, reply) => ({
  parentId,
  type: SUCCESS,
  model: reply,
  message: 'Comment added!',
});

export const submit = (parentId, { text }) => async (dispatch, getState) => {
  const state = getState();
  const model = modelFromThingId(parentId, state);

  if (!model) {
    dispatch({ type: FAILURE });
    return;
  }

  try {
    const apiResponse = await model.reply(apiOptionsFromState(state), text);
    const reply = apiResponse.getModelFromRecord(apiResponse.results[0]);

    dispatch(success(parentId, reply));

    logReply(reply, getState());
  } catch (e) {
    dispatch({ type: FAILURE });
  }
};


function logReply(reply, state) {
  // If the parent starts with a t1, then its parent is a comment. If not,
  // then its parent is a post.
  const stateKey = reply.parentId.startsWith('t1') ? 'comments' : 'posts';
  const parent = state[stateKey][reply.parentId];
  const post = state.posts[reply.linkId];

  getEventTracker().track('comment_events', 'cs.comment', {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    comment_id: convertId(reply.name),
    comment_fullname: reply.name,
    comment_body: reply.bodyMD,
    post_id: convertId(post.name),
    post_fullname: post.name,
    post_created_ts: post.createdUTC * 1000,
    parent_id: convertId(parent.name),
    parent_fullname: parent.name,
    parent_created_ts: parent.createdUTC * 1000,
  });
}
