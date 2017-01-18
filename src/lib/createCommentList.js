import {
  COMMENT,
  COMMENT_LOAD_MORE,
  COMMENT_CONTINUE_THREAD,
} from 'apiClient/models/thingTypes';

const INITIAL_RESULT = {
  list: [],
  currentCollapsedDepth: Infinity,
};

/**
 * Given data from the store, create a flat list of comments to display in the
 * comment tree
 * @module helpers/createCommentList
 * @param   {object} data - A dictionary of named inputs
 * @param   {array} data.commentsList - A `postCommentsList` from the data store
 * @param   {object} data.collapsedComments - A set-like dictionary of comment
 *                   ids that are collapsed.
 * @param   {object} data.allComments - A dictionary of all the comment objects
 *                   in the store.
 * @param   {object} data.allLoadMoreComments - A dictionary of all the
 *                   "load more comments" objects in the data store.
 * @param   {object} data.allContinueThreads - A dictionary of all the
 *                   "continue threads" objects in the data store.
 * @param   {object} data.pendingLoadMore - A dictionary of which "load more"
 *                   objects are pending an api call to replace them with
 *                   comments.
 * @returns {array} A flat list comments
 */
export default function createCommentList(data={}) {
  const {
    commentsList,
    collapsedComments,
    allComments,
    allLoadMoreComments,
    allContinueThreads,
    pendingLoadMore,
  } = data;

  const makeList = (result, { depth, uuid, type }) => {
    // check if the comment should be hidden because an ancestor was collapsed
    const isHidden = depth > result.currentCollapsedDepth;

    // check if this comment itself is collapsed
    const isCollapsed = !!collapsedComments[uuid];

    // do we need to reset the currentCollapsedDepth?
    let currentCollapsedDepth = result.currentCollapsedDepth;
    if (!isHidden) {
      if (isCollapsed) {
        currentCollapsedDepth = depth;
      } else {
        currentCollapsedDepth = Infinity;
      }
    }

    // grab the right model
    let model;
    if (type === COMMENT) {
      model = allComments[uuid];
    } else if (type === COMMENT_LOAD_MORE) {
      model = {
        ...allLoadMoreComments[uuid],
        isPending: !!pendingLoadMore[uuid],
      };
    } else if (type === COMMENT_CONTINUE_THREAD) {
      model = allContinueThreads[uuid];
    }

    // build the structure out
    const obj = {
      depth,
      isHidden,
      type,
      data: {
        ...model,
        isCollapsed,
      },
    };

    return {
      currentCollapsedDepth,
      list: result.list.concat([obj]),
    };
  };

  return commentsList.reduce(makeList, INITIAL_RESULT).list;
}

