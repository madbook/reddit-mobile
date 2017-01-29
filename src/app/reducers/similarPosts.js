import merge from 'platform/merge';

import * as similarPostsActions from 'app/actions/similarPosts';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case similarPostsActions.RECEIVED_SIMILAR_POSTS: {

      return merge(state, {
        [action.postId]: action.apiResponse.results.map(p => p.uuid),
      });
    }

    default:
      return state;
  }
};
