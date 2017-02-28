import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import has from 'lodash/has';

import * as navigationActions from 'platform/actions';
import { METHODS } from 'platform/router';
import * as replyActions from 'app/actions/reply';
import crawlerRequestSelector from 'app/selectors/crawlerRequestSelector';

import RelevantContent from 'app/components/RelevantContent';
import CommentTree from 'app/components/CommentTree';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import RecommendedPosts from 'app/components/RecommendedPosts';
import RecommendedSubreddits from 'app/components/RecommendedSubreddits';
import SubNav from 'app/components/SubNav';
import getSubreddit from 'lib/getSubredditFromState';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';


const T = React.PropTypes;

function CommentsPage(props) {
  const {
    pageParams,
    commentsPageId,
    post,
    isReplying,
    currentPage,
    preferences,
    isCrawlerRequest,
    postLoaded,
    onSortChange,
    onToggleReply,
    spoilersEnabled,
  } = props;

  if (!postLoaded) {
    return (
      <div className='CommentsPage'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='CommentsPage'>
      <SubNav />
      <Post
        postId={ pageParams.id }
        single={ true }
        subredditShowSpoilers={ spoilersEnabled }
        key='post'
      />
      <RecommendedPosts
        postId={ pageParams.id }
        postLoaded={ postLoaded }
      />
      <RecommendedSubreddits
        postId={ pageParams.id }
        postLoaded={ postLoaded }
      />
      <CommentsPageTools
        key='tools'
        isReplying={ isReplying }
        post={ post }
        hasSingleComment={ has(pageParams, 'query.comment') }
        currentPage={ currentPage }
        preferences={ preferences }
        id={ pageParams.id }
        onSortChange={ onSortChange }
        onToggleReply={ onToggleReply }
      />

      <RelevantContent postId={ pageParams.id } />
      <CommentTree
        pageId={ commentsPageId }
        pageUrl={ currentPage.url }
        post={ post }
        isCrawlerRequest={ isCrawlerRequest }
      />
    </div>
  );
}

CommentsPage.propTypes = {
  commentsPageId: T.string.isRequired,
  post: T.object,
  isReplying: T.bool.isRequired,
  pageParams: T.object.isRequired,
  currentPage: T.object.isRequired,
  preferences: T.object.isRequired,
  isCrawlerRequest: T.bool.isRequired,
  postLoaded: T.bool.isRequired,
  onSortChange: T.func.isRequired,
  onToggleReply: T.func.isRequired,
};


const stateProps = createSelector(
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    return paramsToCommentsPageId(pageParams);
  },
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    return state.posts[pageParams.id];
  },
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    return !!state.replying[pageParams.id];
  },
  state => {
    const subredditName = getSubreddit(state);
    if (!subredditName) {
      return false;
    }
    const subreddit = state.subreddits[subredditName.toLowerCase()];
    return subreddit ? subreddit.spoilersEnabled : false;
  },
  state => state.platform.currentPage,
  state => state.preferences,
  crawlerRequestSelector,
  (commentsPageId, post, isReplying, spoilersEnabled, currentPage,
   preferences, isCrawlerRequest) => {
    const postLoaded = !!post;

    return {
      commentsPageId,
      post,
      isReplying,
      currentPage,
      preferences,
      isCrawlerRequest,
      postLoaded,
      spoilersEnabled,
    };
  },
);

const dispatchProps = dispatch => ({
  onToggleReply: id => dispatch(replyActions.toggle(id)),
  navigateToUrl: (url, query) => dispatch(
    navigationActions.navigateToUrl(METHODS.GET, url, query)
  ),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { currentPage: { url, queryParams } } = stateProps;
  const {
    navigateToUrl,
    onToggleReply,
  } = dispatchProps;

  return {
    ...stateProps,
    ...ownProps,
    pageParams: CommentsPageHandler.pageParamsToCommentsPageParams(ownProps),
    onSortChange: sort => navigateToUrl(url, { queryParams: { ...queryParams, sort } }),
    onToggleReply: () => onToggleReply(stateProps.post.name),
  };
};


export default connect(stateProps, dispatchProps, mergeProps)(CommentsPage);
