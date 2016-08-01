import { BaseHandler, METHODS } from '@r/platform/router';
import * as adActions from 'app/actions/ads';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';
import { paramsToPostsListsId } from 'app/models/PostsList';

import { cleanObject } from 'lib/cleanObject';
import { listingTime } from 'lib/listingTime';
import { fetchUserBasedData } from './handlerCommon';

export default class PostsFromSubreddit extends BaseHandler {
  static pageParamsToSubredditPostsParams({ urlParams, queryParams}) {
    const { multi, multiUser } = urlParams;
    const { sort, after, before } = queryParams;
    let { subredditName } = urlParams;
    subredditName = subredditName ? subredditName.toLowerCase() : null;

    return cleanObject({
      subredditName,
      multi,
      multiUser,
      sort,
      t: listingTime(queryParams, sort),
      after,
      before,
    });
  }

  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const subredditPostsParams = PostsFromSubreddit.pageParamsToSubredditPostsParams(this);
    dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams));

    const postsListId = paramsToPostsListsId(subredditPostsParams);
    dispatch(adActions.fetchNewAdForPostsList(postsListId, {
      urlParams: this.urlParams,
      queryParams: this.queryParams,
    }));

    const { subredditName } = subredditPostsParams;
    dispatch(subredditActions.fetchSubreddit(subredditName));
    fetchUserBasedData(dispatch);
  }
}
