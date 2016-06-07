import { take, uniq } from 'lodash/array';

import * as commentsPageActions from 'app/actions/commentsPage';

import { VISITED_POSTS_COUNT } from 'app/constants';

const DEFAULT = [];

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case commentsPageActions.VISITED_COMMENTS_PAGE: {
      const { postId } = action;
      // Avoid modifying the state if this operation is essentially a no-op.
      if (state[0] === postId) {
        return state;
      }
      return take(uniq([postId].concat(state)), VISITED_POSTS_COUNT);
    }
    default: return state;
  }
}
