import merge from '@r/platform/merge';
import * as commentsPageActions from 'app/actions/commentsPage';
import { newCommentsPage } from 'app/models/CommentsPage';
import * as loginActions from 'app/actions/login';

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
