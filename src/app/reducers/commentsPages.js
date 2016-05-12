import merge from '@r/platform/merge';
import * as commentsPageActions from '../actions/commentsPage';
import { newCommentsPage } from '../models/CommentsPage';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentsPageActions.FETCHING_COMMENTS_PAGE: {
      const { commentsPageId, commentsPageParams } = action;
      const currentCommentsPage = state[commentsPageId];
      if (currentCommentsPage) { return state; }

      return merge(state, {
        [commentsPageId]: newCommentsPage(commentsPageId, commentsPageParams),
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
      });
    }

    default: return state;
  }
};
