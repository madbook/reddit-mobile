import merge from 'platform/merge';
import * as subredditsToPostsByPostActions from 'app/actions/subredditsToPostsByPost';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case subredditsToPostsByPostActions.RECEIVED_SUBREDDITS_TO_POSTS_BY_POST: {

      return merge(state, {
        [action.postId]: action.apiResponse.results.map(p => p.uuid),
      });
    }

    default:
      return state;
  }
};
