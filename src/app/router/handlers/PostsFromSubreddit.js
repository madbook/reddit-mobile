import { setStatus } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

import * as adActions from 'app/actions/ads';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { FAKE_SUBS } from 'lib/isFakeSubreddit';
import { cleanObject } from 'lib/cleanObject';
import { listingTime } from 'lib/listingTime';
import { fetchUserBasedData } from './handlerCommon';
import { getBasePayload, buildSubredditData, convertId, logClientScreenView } from 'lib/eventUtils';


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

  async [METHODS.GET](dispatch, getState) {
    const state = getState();

    if (state.platform.shell) { return; }

    const subredditPostsParams = PostsFromSubreddit.pageParamsToSubredditPostsParams(this);
    const postsListId = paramsToPostsListsId(subredditPostsParams);
    const { subredditName } = subredditPostsParams;

    await Promise.all([
      fetchUserBasedData(dispatch),
      dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams)),
      dispatch(subredditActions.fetchSubreddit(subredditName)),
    ]);

    dispatch(adActions.fetchNewAdForPostsList(postsListId, {
      urlParams: this.urlParams,
      queryParams: this.queryParams,
    }));

    dispatch(setStatus(getState().postsLists[postsListId].responseCode));

    logClientScreenView(buildScreenViewData, getState());
  }
}


const LINK_LIMIT = 25;

function buildSortOrderData(state) {
  const { currentPage: { queryParams: { sort, time, before, after } } } = state.platform;

  return {
    target_sort: sort || 'hot',
    target_count: LINK_LIMIT,
    target_filter_time: sort === 'top' ? (time || 'all') : null,
    target_before: before ? before : null,
    target_after: after ? after : null,
  };
}


function buildScreenViewData(state) {
  const { subredditName } = state.platform.currentPage.urlParams;

  let target_id = null;
  let target_fullname = null;
  let listing_name = null;

  // There's some unfortunate special handling here. The frontpage doesn't
  // have a subredditName, multi's are delimited by a '+', filters by a '-',
  // and some "fake" subreddits have special listing names.
  if (!subredditName) {
    listing_name = 'frontpage';
  } else if (subredditName.indexOf('+') > -1) {
    listing_name = 'multi';
  } else if (subredditName.indexOf('-') > -1) {
    listing_name = 'all (filtered)';
  } else if (FAKE_SUBS.includes(subredditName)) {
    listing_name = subredditName;
  } else {
    const subreddit = state.subreddits[subredditName.toLowerCase()];
    target_id = convertId(subreddit.id);
    target_fullname = subreddit.name;
    listing_name = subreddit.uuid;
  }

  return cleanObject({
    listing_name,
    target_id,
    target_fullname,
    target_type: 'listing',
    ...getBasePayload(state),
    ...buildSortOrderData(state),
    ...buildSubredditData(state),
  });
}
