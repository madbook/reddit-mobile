import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import { newCommentsPage } from 'app/models/CommentsPage';

import * as commentsPageActions from 'app/actions/commentsPage';
import * as loginActions from 'app/actions/login';
import * as apiResponseActions from 'app/actions//apiResponse';

const { COMMENT, thingType } = models.ModelTypes;

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

    case commentsPageActions.RECEIEVED_COMMENTS_PAGE: {
      const { commentsPageId, commentsPageResults } = action;
      const currentCommentsPage = state[commentsPageId];
      if (!currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: {
          loading: false,
          results: commentsPageResults,
        },
        current: commentsPageId,
      });
    }

    case apiResponseActions.NEW_MODEL: {
      if (!state.loaded) { return state; }
      const { kind, model } = action;
      if (kind !== COMMENT) { return state; }

      // We want to add the comment to position 0 in the comments page result
      // list, _only_ if it doesn't have a parent (meaning that it's a top
      // level comment).
      if (model.parentId && thingType(model.parentId) === COMMENT) { return state; }

      const record = model.toRecord();
      const currentPage = state[state.current].splice(0, 0, record);

      return merge(state, {
        [state.current]: {
          results: currentPage,
        },
      });
    }

    default: return state;
  }
};
