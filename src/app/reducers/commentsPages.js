import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import { newCommentsPage } from 'app/models/CommentsPage';

import * as commentsPageActions from 'app/actions/commentsPage';
import * as loginActions from 'app/actions/login';
import * as apiResponseActions from 'app/actions//apiResponse';

const { COMMENT } = models.ModelTypes;

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
      const { commentsPageId, commentsPageResults } = action;
      const currentCommentsPage = state[commentsPageId];
      if (!currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: {
          loading: false,
          // TODO: what happens if a user adds a comment before results come back?
          results: commentsPageResults,
        },
        // TODO: this feels inherently race condition-ish
        current: commentsPageId,
      });
    }

    case apiResponseActions.NEW_MODEL: {
      const { kind, model } = action;
      if (kind !== COMMENT) { return state; }

      const currentPage = state[state.current];
      if (!currentPage) { return state; }

      // We want to add the comment to position 0 in the comments page result
      // list, _only_ if its parent is the link id for the comment page).
      if (currentPage.postId !== model.parentId) { return state; }

      const record = model.toRecord();
      const pageRecords = [record, ...state[state.current].results];

      return merge(state, {
        [state.current]: {
          results: pageRecords,
        },
      });
    }

    default: return state;
  }
};
