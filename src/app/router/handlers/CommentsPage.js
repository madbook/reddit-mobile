import { setStatus } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { models } from '@r/api-client';

import { cleanObject } from 'lib/cleanObject';
import { fetchUserBasedData } from './handlerCommon';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as subredditActions from 'app/actions/subreddits';
import * as recommendedSubredditsActions from 'app/actions/recommendedSubreddits';
import * as replyActions from 'app/actions/reply';
import { flags } from 'app/constants';
import { getBasePayload, buildSubredditData, convertId, logClientScreenView } from 'lib/eventUtils';
import features from 'app/featureFlags';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';

const {
  VARIANT_RECOMMENDED_TOP_PLAIN,
  VARIANT_SUBREDDIT_HEADER,
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

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const commentsPageParams = CommentsPage.pageParamsToCommentsPageParams(this);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const { subredditName } = state.platform.currentPage.urlParams;

    await Promise.all([
      dispatch(commentsPageActions.fetchCommentsPage(commentsPageParams)),
      fetchUserBasedData(dispatch),

      dispatch(commentsPageActions.fetchRelevantContent()),
      dispatch(commentsPageActions.visitedCommentsPage(this.urlParams.postId)),
      fetchRecommendedSubreddits(state, dispatch, subredditName),

      dispatch(subredditActions.fetchSubreddit(subredditName)),
    ]);

    dispatch(setStatus(getState().commentsPages[commentsPageId].responseCode));

    logClientScreenView(buildScreenViewData, getState());
  }

  async [METHODS.POST](dispatch, getState, { waitForState }) {
    const { thingId, text } = this.bodyParams;

    const state = getState();

    if (!state.session.isValid) {
      return dispatch(platformActions.setPage('/login'));
    }

    await waitForState(state => state.session.isValid && !state.sessionRefreshing, () => {
      try {
        dispatch(replyActions.reply(thingId, text));

        // Go back to the state before the comment form was opened, if we can go
        // back. Otherwise, redirect to the redirectUrl passed in.
        if (history && state.platform.history.length) {
          return history.go(-1);
        }/* else {
          // todo fix after implementing referrer
          // dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
        }*/
      } catch (e) {
        console.log('Error commenting');
        console.log(e);
      }
    });
  }
}

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

function buildScreenViewData(state) {
  const { currentPage: { queryParams, urlParams } } = state.platform;
  const fullName =`t3_${urlParams.postId}`;
  const post = state.posts[fullName];

  if (!post) {
    return null;
  }

  return cleanObject({
    target_fullname: fullName,
    target_id: convertId(post.id),
    target_type: post.isSelf ? 'self' : 'link',
    target_sort: queryParams.sort || 'confidence',
    target_url: post.cleanUrl,
    target_filter_time: queryParams.sort === 'top' ? (queryParams.time || 'all') : null,
    ...buildSubredditData(state),
    ...getBasePayload(state),
  });
}
