import findIndex from 'lodash/findIndex';

import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';

import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';

const DEFAULT = {};

/**
 * Reducer for storing a flattened comment tree for a post. The flattened list
 * is keyed by a hash of page params.
 * Structure in state: STATE.postCommentsLists.data
 * @name data
 * @memberof reducers/postCommentsLists
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }
    case commentsPageActions.RECEIVED_COMMENTS_PAGE: {
      const { results, pageId } = action.payload;
      return { ...state, [pageId]: results, current: pageId };
    }
    case commentActions.MORE_COMMENTS_SUCCESS: {
      const { pageId, loadMoreId, results } = action.payload;
      const existingList = state[pageId];
      const loadMoreIndex = findIndex(existingList, obj => obj.uuid === loadMoreId);
      const originalDepth = existingList[loadMoreIndex].depth;
      const newList = existingList
        .slice(0, loadMoreIndex)
        .concat(results.map(({ uuid, depth, type }) => ({
          uuid,
          type,
          depth: originalDepth + depth,
        })))
        .concat(existingList.slice(loadMoreIndex + 1));

      return {
        ...state,
        [pageId]: newList,
      };
    }
    case replyActions.SUCCESS: {
      const { model } = action;
      const isTopLevelComment = model.linkId === model.parentId;
      const currentPage = state[state.current];
      if (!isTopLevelComment) {

        const index = findIndex(currentPage, obj => obj.uuid === model.parentId);
        const parent = currentPage[index];
        const updatedModel = model.set({ depth: parent.depth + 1 });
        const newRecord = updatedModel.toRecord();

        const newList = currentPage
          .slice(0, index + 1)
          .concat([newRecord])
          .concat(currentPage.slice(index + 1));

        return {
          ...state,
          [state.current]: newList,
        };
      }

      const updatedModel = model.set({ depth: 0 });
      const newCommentRecord = updatedModel.toRecord();
      const flatCommentList = [newCommentRecord, ...currentPage];

      return {
        ...state,
        [state.current]: flatCommentList,
      };
    }
    default: return state;
  }
};
