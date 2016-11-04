import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import has from 'lodash/has';

import * as navigationActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import * as replyActions from 'app/actions/reply';
import crawlerRequestSelector from 'app/selectors/crawlerRequestSelector';

import RelevantContent from 'app/components/RelevantContent';
import CommentsList from 'app/components/CommentsList';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import GoogleCarouselMetadata from 'app/components/GoogleCarouselMetadata';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import SubNav from 'app/components/SubNav';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';


const T = React.PropTypes;

function CommentsPage(props) {
  const {
    pageParams,
    commentsPage,
    post,
    isReplying,
    topLevelComments,
    currentPage,
    preferences,
    isCrawlerRequest,
    op,
    postLoaded,
    onSortChange,
    onToggleReply,
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
      <Post postId={ pageParams.id } single={ true } key='post' />
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

      { !commentsPage || commentsPage.loading
        ? <Loading />
        : <CommentsList
            commentRecords={ topLevelComments }
            className='CommentsList__topLevel'
            op={ op }
            nestingLevel={ 0 }
            votingDisabled={ post.archived }
          />
      }

      { isCrawlerRequest && commentsPage && topLevelComments.length ?
        <GoogleCarouselMetadata
          postId={ pageParams.id }
          commentRecords={ topLevelComments }
          pageUrl={ currentPage.url }
        />
        : null
      }

    </div>
  );
}

CommentsPage.propTypes = {
  commentsPage: T.object,
  post: T.object,
  isReplying: T.bool.isRequired,
  pageParams: T.object.isRequired,
  topLevelComments: T.arrayOf(T.object).isRequired,
  currentPage: T.object.isRequired,
  preferences: T.object.isRequired,
  isCrawlerRequest: T.bool.isRequired,
  op: T.string.isRequired,
  postLoaded: T.bool.isRequired,
  onSortChange: T.func.isRequired,
  onToggleReply: T.func.isRequired,
};


const stateProps = createSelector(
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    const commentsPageId = paramsToCommentsPageId(pageParams);
    return state.commentsPages[commentsPageId];
  },
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    return state.posts[pageParams.id];
  },
  (state, props) => {
    const pageParams = CommentsPageHandler.pageParamsToCommentsPageParams(props);
    return !!state.replying[pageParams.id];
  },
  state => state.platform.currentPage,
  state => state.preferences,
  crawlerRequestSelector,
  (commentsPage, post, isReplying, currentPage, preferences, isCrawlerRequest) => {
    const postLoaded = !!post;

    return {
      commentsPage,
      post,
      isReplying,
      topLevelComments: (!commentsPage || commentsPage.loading) ? [] : commentsPage.results,
      currentPage,
      preferences,
      isCrawlerRequest,
      postLoaded,
      op: postLoaded ? post.author : '',
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
  const { navigateToUrl, onToggleReply } = dispatchProps;

  return {
    ...stateProps,
    ...ownProps,
    pageParams: CommentsPageHandler.pageParamsToCommentsPageParams(ownProps),
    onSortChange: sort => navigateToUrl(url, { queryParams: { ...queryParams, sort } }),
    onToggleReply: () => onToggleReply(stateProps.post.name),
  };
};


export default connect(stateProps, dispatchProps, mergeProps)(CommentsPage);
