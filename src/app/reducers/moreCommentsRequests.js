import merge from '@r/platform/merge';

import * as commentActions from 'app/actions/comment';


const DEFAULT = {};

export const DEFAULT_COMMENT_REQUEST = { loading: false };

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentActions.MORE_COMMENTS_FETCHING: {
      return merge(state, {
        [action.parentCommentId]: { loading: true },
      });
    }

    case commentActions.MORE_COMMENTS_RECEIVED: {
      return merge(state, {
        [action.parentCommentId]: { loading: false },
      });
    }

    case commentActions.MORE_COMMENTS_FAILURE: {
      return merge(state, {
        [action.parentCommentId]: DEFAULT_COMMENT_REQUEST,
      });
    }

    default:
      return state;
  }
};
