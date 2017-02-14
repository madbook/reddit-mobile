import { setStatus } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';
import { models } from '@r/api-client';

import { cleanObject } from 'lib/cleanObject';
import { fetchUserBasedData } from './handlerCommon';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as subredditActions from 'app/actions/subreddits';
//import * as recommendedSubredditsActions from 'app/actions/recommendedSubreddits';
import * as similarPostsActions from 'app/actions/similarPosts';
import * as subredditsByPostActions from 'app/actions/subredditsByPost';
import * as subredditsToPostsByPostActions from 'app/actions/subredditsToPostsByPost';
import { flags } from 'app/constants';
import features from 'app/featureFlags';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';
import { setTitle } from 'app/actions/pageMetadata';
import { convertId, trackPageEvents } from 'lib/eventUtils';

const {
  //VARIANT_RECOMMENDED_TOP_PLAIN,
  //VARIANT_SUBREDDIT_HEADER,
  VARIANT_RECOMMENDED_BY_POST_TOP_ALL,
  VARIANT_RECOMMENDED_BY_POST_TOP_DAY,
  VARIANT_RECOMMENDED_BY_POST_TOP_MONTH,
  VARIANT_RECOMMENDED_BY_POST_HOT,
} = flags;


const { POST_TYPE } = models.ModelTypes;
const PostIdRegExp = new RegExp(`^${POST_TYPE}_`);

const ensurePostTypePrefix = postId => {
  if (PostIdRegExp.test(postId)) { return postId; }

  return `${POST_TYPE}_${postId}`;
};


export default class CommentsPage extends BaseHandler {

  static pageParamsToCommentsPageParams({ urlParams, queryParams}) {
    let { postId } = urlParams;
    const { commentId } = urlParams;
    const { sort, context } = queryParams;

    postId = ensurePostTypePrefix(postId);

    let query;
    if (commentId) {
      query = {
        comment: commentId,
        context,
      };
    }

    return cleanObject({
      id: postId,
      sort,
      query,
    });
  }

  buildTitle (state, pageId) {
    const page = state.commentsPages[pageId];
    const post = state.posts[page.postId];

    if (post) {
      return `${post.title} - ${post.subreddit}`;
    }
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const commentsPageParams = CommentsPage.pageParamsToCommentsPageParams(this);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    let { subredditName } = state.platform.currentPage.urlParams;

    await Promise.all([
      dispatch(commentsPageActions.fetchCommentsPage(commentsPageParams)),
      fetchUserBasedData(dispatch),

      dispatch(commentsPageActions.fetchRelevantContent()),
      dispatch(commentsPageActions.visitedCommentsPage(this.urlParams.postId)),
      dispatch(subredditActions.fetchSubreddit(subredditName)),

    ]);

    // if url does not include r/subredditName, then subredditName will be
    // undefined, even if we are on a comments page. We can ascertain the
    // subredditName by looking it up via postId
    const post = getState().posts[`t3_${this.urlParams.postId}`];
    if (!subredditName && post) {
      subredditName = post.subreddit;
    }

    if (post) {
      fetchSimilarPosts(state, dispatch, post);
      fetchRecommendedSubredditsByPost(state, dispatch, post);
      fetchRecommendedSubredditsToPostsByPost(state, dispatch, post);
    }

    dispatch(setStatus(getState().commentsPages[commentsPageId].responseCode));

    dispatch(setTitle(this.buildTitle(getState(), commentsPageId)));

    const latestState = getState();
    trackPageEvents(latestState, buildAdditionalEventData(latestState));
  }
}

/* deprecated for now, comment out to prevent lint error
const fetchRecommendedSubreddits = (state, dispatch, subredditName) => {
  const feature = features.withContext({ state });

  if (feature.enabled(VARIANT_SUBREDDIT_HEADER)) {
    return;
  }

  let max_recs = 3;
  if (feature.enabled(VARIANT_RECOMMENDED_TOP_PLAIN)) {
    max_recs = 7;
  }

  dispatch(recommendedSubredditsActions.fetchRecommendedSubreddits(subredditName, max_recs));
};
*/

const fetchSimilarPosts = (state, dispatch, post) => {
  let experimentId = 105;
  dispatch(similarPostsActions.fetchSimilarPosts(post, experimentId));
};

const fetchRecommendedSubredditsByPost = (state, dispatch, post) => {
  let experimentId = 105;
  dispatch(subredditsByPostActions.fetchSubredditsByPost(post, experimentId));
};

const fetchRecommendedSubredditsToPostsByPost = (state, dispatch, post) => {
  const feature = features.withContext({ state });
  let experimentId = 105;
  let time = '';
  let sort = '';
  if (feature.enabled(VARIANT_RECOMMENDED_BY_POST_TOP_ALL)) {
    sort = 'top';
    time = 'all';
  } else if (feature.enabled(VARIANT_RECOMMENDED_BY_POST_TOP_DAY)) {
    sort = 'top';
    time = 'day';
  } else if (feature.enabled(VARIANT_RECOMMENDED_BY_POST_TOP_MONTH)) {
    sort = 'top';
    time = 'month';
  } else if (feature.enabled(VARIANT_RECOMMENDED_BY_POST_HOT)) {
    sort = 'hot';
    time = 'all';
  }
  dispatch(subredditsToPostsByPostActions.fetchSubredditsToPostsByPost(post, sort, time, experimentId));
};

function buildAdditionalEventData(state) {
  const { currentPage: { queryParams, urlParams } } = state.platform;
  const fullName =`t3_${urlParams.postId}`;
  const post = state.posts[fullName];

  if (!post) {
    return null;
  }

  return cleanObject({
    target_fullname: fullName,
    nsfw: post.over18,
    post_fullname: fullName,
    spoiler: post.spoiler,
    target_id: convertId(post.id),
    target_type: post.isSelf ? 'self' : 'link',
    target_sort: queryParams.sort || 'confidence',
    target_url: post.cleanUrl,
    target_filter_time: queryParams.sort === 'top' ? (queryParams.time || 'all') : null,
    target_created_ts: post.createdUTC * 1000,
  });
}
