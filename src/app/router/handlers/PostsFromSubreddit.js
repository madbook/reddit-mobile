import { BaseHandler, METHODS } from '@r/platform/router';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';

import { cleanObject } from 'lib/cleanObject';
import { fetchUserBasedData } from './handlerCommon';
import isFakeSubreddit from 'lib/isFakeSubreddit';

export default class PostsFromSubreddit extends BaseHandler {
  static PageParamsToSubredditPostsParams({ urlParams, queryParams}) {
    const { multi, multiUser } = urlParams;
    const { sort, t, after, before } = queryParams;
    let { subredditName } = urlParams;
    subredditName = subredditName ? subredditName.toLowerCase() : null;

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

  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const subredditPostsParams = PostsFromSubreddit.PageParamsToSubredditPostsParams(this);
    dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams));

    const { subredditName } = subredditPostsParams;
    if (!isFakeSubreddit(subredditName)) {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    }

    fetchUserBasedData(dispatch);
  }
}
