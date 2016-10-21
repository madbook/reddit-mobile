import merge from '@r/platform/merge';

import { newCommentsPage } from 'app/models/CommentsPage';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case commentsPageActions.FETCHING_COMMENTS_PAGE: {
      const { commentsPageId, commentsPageParams } = action;
      const currentCommentsPage = state[commentsPageId];
      if (currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: newCommentsPage(commentsPageId, commentsPageParams),
        current: commentsPageId,
      });
    }

    case commentsPageActions.RECEIVED_COMMENTS_PAGE: {
      const { commentsPageId, apiResponse } = action;
      const currentCommentsPage = state[commentsPageId];
      if (!currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: {
          loading: false,
          results: apiResponse.results,
          responseCode: apiResponse.response.status,
        },
        current: commentsPageId,
      });
    }

    case commentsPageActions.FAILED: {
      const { commentsPageId, error } = action;
      const currentCommentsPage = state[commentsPageId];
      if (!currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: {
          loading: false,
          responseCode: error.status,
        },
      });
    }

    case replyActions.SUCCESS: {
      // If the comment is in reply to a post, we have to update its comment page.
      // To simplify things we only look at the current comments page (which should be
      // the only page you're able to reply to). This is simpler because comment pages
      // use the hash of their params as their key in state. This is because there
      // are lots of params like sort, time, postId, commentId (for permalinks), etc.
      // To do this 'the right way' we'd have to look at either comment page in state
      // OR keep a map of postId to a list of commentPages.

      const { model } = action;
      const currentPage = state[state.current];
      if (!currentPage || currentPage.postId !== model.parentId) {
        return state;
      }

      const newCommentRecord = model.toRecord();
      const topLevelComments = [newCommentRecord, ...currentPage.results];

      return merge(state, {
        [state.current]: {
          results: topLevelComments,
        },
      });
    }

    default: return state;
  }
};
