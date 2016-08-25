import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { some } from 'lodash/collection';
import { has } from 'lodash/object';
import * as navigationActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import { flags } from 'app/constants';
import { featuresSelector } from 'app/selectors/features';
import crawlerRequestSelector from 'app/selectors/crawlerRequestSelector';

import CommentsList from 'app/components/CommentsList';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import GoogleCarouselMetadata from 'app/components/GoogleCarouselMetadata';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import SubNav from 'app/components/SubNav';
import RelevantContent from 'app/components/RelevantContent';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;

const stateProps = createSelector(
  (state, props) => props,
  state => state.commentsPages,
  state => state.posts,
  state => state.platform.currentPage,
  featuresSelector,
  crawlerRequestSelector,
  (pageProps, commentsPages, posts, currentPage, feature, isCrawlerRequest) => {
    const commentsPageParams = CommentsPageHandler.pageParamsToCommentsPageParams(pageProps);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const commentsPage = commentsPages[commentsPageId];
    const topLevelComments = (!commentsPage || commentsPage.loading)
      ? []
      : commentsPage.results;

    const post = posts[commentsPageParams.id];
    const postLoaded = !!post;
    const replying = currentPage.queryParams.commentReply === commentsPageParams.id;

    return {
      op: postLoaded ? post.author : '',
      postLoaded,
      commentsPageParams,
      commentsPage,
      commentsPageId,
      topLevelComments,
      currentPage,
      replying,
      feature,
      isCrawlerRequest,
      post,
    };
  },
);

const dispatchProps = dispatch => ({
  navigateToUrl(url, query) {
    dispatch(navigationActions.navigateToUrl(METHODS.GET, url, query));
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { currentPage, currentPage: { queryParams } } = stateProps;
  const { navigateToUrl } = dispatchProps;

  const onSortChange = sort => {
    navigateToUrl(currentPage.url, {
      queryParams: {
        ...queryParams,
        sort,
      },
    });
  };

  return {
    ...stateProps,
    ...ownProps,
    onSortChange,
  };
};

export const CommentsPage = connect(stateProps, dispatchProps, mergeProps)(props => {
  const {
    op,
    commentsPage,
    commentsPageParams,
    topLevelComments,
    postLoaded,
    currentPage,
    replying,
    feature,
    onSortChange,
    isCrawlerRequest,
    post,
  } = props;


  return (
    <div className='CommentsPage BelowTopNav'>
      { postLoaded && <SubNav /> }
      { !postLoaded ?
        <Loading /> : [
          <Post postId={ commentsPageParams.id } single={ true } key='post' />,
          <CommentsPageTools
            key='tools'
            replying={ replying }
            post={ post }
            hasSingleComment={ has(commentsPageParams, 'query.comment') }
            currentPage={ currentPage }
            id={ commentsPageParams.id }
            onSortChange={ onSortChange }
          />,
        ]
      }

      { !commentsPage || commentsPage.loading ?
        <Loading /> :
        <CommentsList
          op={ op }
          commentRecords={ topLevelComments }
          className={ 'CommentsList__topLevel' }
        /> }

      { isCrawlerRequest && postLoaded && commentsPage && topLevelComments.length ?
        <GoogleCarouselMetadata
          postId={ commentsPageParams.id }
          commentRecords={ topLevelComments }
          pageUrl={ currentPage.url }
        />
        : null
      }

      { some([
        VARIANT_NEXTCONTENT_BOTTOM,
      ], x => feature.enabled(x)) &&
        <RelevantContent
          postId={ commentsPageParams.id }
        />
      }
    </div>
  );
});
