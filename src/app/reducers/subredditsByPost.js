import merge from 'platform/merge';
import * as subredditsByPostActions from 'app/actions/subredditsByPost';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case subredditsByPostActions.RECEIVED_SUBREDDITS_BY_POST: {

      return merge(state, {
        [action.postId]: action.apiResponse.results.map(sr => sr.uuid),
      });
    }

    default:
      return state;
  }
};
