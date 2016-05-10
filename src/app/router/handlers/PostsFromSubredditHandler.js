import { BaseHandler, METHODS } from '@r/platform/router';
import * as postsListActions from '../../actions/postsListActions';

import { cleanObject } from '../../../lib/cleanObject';

export default class PostsFromSubredditHandler extends BaseHandler {
  static PageParamsToSubredditPostsParams({ urlParams, queryParams}) {
    const { subredditName, multi, multiUser } = urlParams;
    const { sort, t, after, before } = queryParams;

    return cleanObject({
      subredditName,
      multi,
      multiUser,
      sort,
      t,
      after,
      before,
    });
  }

  async [METHODS.GET](dispatch/*, getState, utils*/) {
    const subredditPostsParams = PostsFromSubredditHandler.PageParamsToSubredditPostsParams(this);

    dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams));
  }
}
