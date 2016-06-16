import { BaseHandler, METHODS } from '@r/platform/router';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';

import { cleanObject } from 'lib/cleanObject';
import { fetchUserBasedData } from './handlerCommon';

export default class PostsFromSubreddit extends BaseHandler {
  static pageParamsToSubredditPostsParams({ urlParams, queryParams}) {
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

    const subredditPostsParams = PostsFromSubreddit.pageParamsToSubredditPostsParams(this);
    dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams));

    const { subredditName } = subredditPostsParams;
    dispatch(subredditActions.fetchSubreddit(subredditName));
    fetchUserBasedData(dispatch);
  }
}
