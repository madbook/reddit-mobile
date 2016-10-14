// replies are technically comments. _but_ its an action taken on a post or comment.
// Thus all actions related to replying, opening the form, and making the reply
// are kept in this file.

import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData, convertId } from 'lib/eventUtils';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';


export const TOGGLE_REPLY_FORM = 'TOGGLE_REPLY_FORM';
export const toggleReplyForm = id => ({ type: TOGGLE_REPLY_FORM, id });

export const REPLYING = 'REPLYING';
export const replying = (id, text) => ({ type: REPLYING, id, text });

export const REPLIED = 'REPLIED';
export const replied = (id, model) => ({ type: REPLIED, id, model });

export const reply = (id, text) => async (dispatch, getState) => {
  const state = getState();
  const replyText = text.trim();

  if (!id || !replyText || state.replying[id]) { return; }

  const model = modelFromThingId(id, state);
  if (!model) { return; }

  dispatch(replying(id, text));

  const apiResponse = await model.reply(apiOptionsFromState(state), text);
  // TODO the replyable mixin should just be returning a CommentModel from this...
  const reply = apiResponse.getModelFromRecord(apiResponse.results[0]);
  dispatch(replied(id, reply));

  logReply(reply, getState());
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
