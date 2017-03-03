import { setStatus } from 'platform/actions';
import { BaseHandler, METHODS } from 'platform/router';
import * as adActions from 'app/actions/ads';
import * as postsListActions from 'app/actions/postsList';
import * as subredditActions from 'app/actions/subreddits';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { FAKE_SUBS } from 'lib/isFakeSubreddit';
import { cleanObject } from 'lib/cleanObject';
import { listingTime } from 'lib/listingTime';
import { fetchUserBasedData } from './handlerCommon';
import { convertId, trackPageEvents } from 'lib/eventUtils';

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

    await Promise.all([
      fetchUserBasedData(dispatch),
      dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams)),
      dispatch(subredditActions.fetchSubreddit(subredditName)),
    ]);

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

    // for the time being, if the api fetch fails (such as a user not having
    // access to this subreddit), then we don't want to track
    if (!subreddit) {
      return null;
    }

    target_id = convertId(subreddit.id);
    target_fullname = subreddit.name;
    listing_name = subreddit.uuid;
  }

  return cleanObject({
    listing_name,
    target_id,
    target_fullname,
    target_type: 'listing',
    ...buildSortOrderData(state),
  });
}
