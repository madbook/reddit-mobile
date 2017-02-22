import { setStatus, redirect } from 'platform/actions';
import { BaseHandler, METHODS } from 'platform/router';
import * as adActions from 'app/actions/ads';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';
import { paramsToPostsListsId } from 'app/models/PostsList';
import isFakeSubreddit from 'lib/isFakeSubreddit';
import { cleanObject } from 'lib/cleanObject';
import { listingTime } from 'lib/listingTime';
import { fetchUserBasedData } from './handlerCommon';
import { convertId, getListingName, trackPageEvents } from 'lib/eventUtils';

import { setTitle } from 'app/actions/pageMetadata';

// NOTE: we're deprecating the query param `sort` in favor of its url param.
// You'll find a couple places in this file that fallback to the query param
// since those are still in the wild.

export default class PostsFromSubreddit extends BaseHandler {

  static pageParamsToSubredditPostsParams({ urlParams, queryParams}) {
    const { multi, multiUser, sort } = urlParams;
    const { after, before, sort: queryParamSort } = queryParams;
    let { subredditName } = urlParams;
    subredditName = subredditName ? subredditName.toLowerCase() : null;

    return cleanObject({
      subredditName,
      multi,
      multiUser,
      sort: sort || queryParamSort,
      t: listingTime(queryParams, sort),
      after,
      before,
    });
  }

  buildTitle (state, subredditName) {
    if (!subredditName) { return; }
    const subreddit = state.subreddits[subredditName];

    if (subreddit && subreddit.title) {
      return subreddit.title;
    }
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();

    if (state.platform.shell) { return; }

    const subredditPostsParams = PostsFromSubreddit.pageParamsToSubredditPostsParams(this);
    const postsListId = paramsToPostsListsId(subredditPostsParams);
    const { subredditName } = subredditPostsParams;

    // It should be rare that we need to redirect away from this page, so we
    // should dispatch all of the fetches up front. We wait on fetchSubreddit
    // separately, so that as soon as it completes, we can determine if we need
    // to redirect to a user profile page. If we do not need to redirect, then
    // we contain to wait on the remaining fetches.
    const userAndListingFetches = Promise.all([
      fetchUserBasedData(dispatch),
      dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams)),
    ]);

    await dispatch(subredditActions.fetchSubreddit(subredditName));

    const subreddit = getState().subreddits[subredditName];

    // We don't want to render subreddit listings pages for "user profile-post
    // subreddits", which are an internal implementation aspect of profiles,
    // not first class subreddits.
    if (subreddit && subreddit.subredditType === 'user') {
      dispatch(redirect(subreddit.url));
      return;
    }

    await userAndListingFetches;

    dispatch(adActions.fetchNewAdForPostsList(postsListId, {
      urlParams: this.urlParams,
      queryParams: this.queryParams,
    }));

    const apiRequest = getState().postsLists[postsListId];
    const statusCode = apiRequest && apiRequest.responseCode
      ? apiRequest.responseCode
      : 500;

    dispatch(setStatus(statusCode));
    dispatch(setTitle(this.buildTitle(getState(), subredditName)));

    const latestState = getState();
    trackPageEvents(latestState, buildAdditionalEventData(latestState));
  }
}


const LINK_LIMIT = 25;

function buildSortOrderData(state) {
  const { currentPage: { queryParams, urlParams } } = state.platform;
  const { time, before, after } = queryParams;
  const sort = urlParams.sort || queryParams.sort || 'hot';

  return {
    target_sort: sort,
    target_count: LINK_LIMIT,
    target_filter_time: sort === 'top' ? (time || 'all') : null,
    target_before: before ? before : null,
    target_after: after ? after : null,
  };
}


export function buildAdditionalEventData(state) {
  const { subredditName } = state.platform.currentPage.urlParams;

  let target_id = null;
  let target_fullname = null;
  let listingNameEventData = getListingName(state);

  if (!isFakeSubreddit(subredditName)) {
    const subreddit = state.subreddits[subredditName.toLowerCase()];

    // for the time being, if the api fetch fails (such as a user not having
    // access to this subreddit), then we don't want to track
    if (!subreddit) {
      return null;
    }

    target_id = convertId(subreddit.id);
    target_fullname = subreddit.name;
  }

  return cleanObject({
    target_id,
    target_fullname,
    target_type: 'listing',
    ...buildSortOrderData(state),
    ...listingNameEventData,
  });
}
