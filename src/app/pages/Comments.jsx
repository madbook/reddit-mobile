import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { some } from 'lodash/collection';

import { flags } from 'app/constants';
import { featuresSelector } from 'app/selectors/features';

import CommentsList from 'app/components/CommentsList';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import SubNav from 'app/components/SubNav';
import RelevantContent from 'app/components/RelevantContent';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;

const commentsPageSelector = createSelector(
  (state, props) => props,
  (state) => state.commentsPages,
  (state) => state.posts,
  (state) => state.platform.currentPage,
  featuresSelector,
  (pageProps, commentsPages, posts, currentPage, feature) => {
    const commentsPageParams = CommentsPageHandler.pageParamsToCommentsPageParams(pageProps);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const commentsPage = commentsPages[commentsPageId];
    const topLevelComments = (!commentsPage || commentsPage.loading)
      ? []
      : commentsPage.results;

    const permalinkBase = pageProps.url;
    const postLoaded = !!posts[commentsPageParams.id];

    const replying = currentPage.queryParams.commentReply === commentsPageParams.id;

    return {
      postLoaded,
      commentsPageParams,
      commentsPage,
      commentsPageId,
      permalinkBase,
      topLevelComments,
      currentPage,
      replying,
      feature,
    };
  },
);

export const CommentsPage = connect(commentsPageSelector)((props) => {
  const {
    commentsPage,
    commentsPageParams,
    topLevelComments,
    permalinkBase,
    postLoaded,
    currentPage,
    replying,
    feature,
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
            currentPage={ currentPage }
            id={ commentsPageParams.id }
          />,
        ]
      }

      { !commentsPage || commentsPage.loading ?
        <Loading /> :
        <CommentsList
          commentRecords={ topLevelComments }
          permalinkBase={ permalinkBase }
          className={ 'CommentsList__topLevel' }
        /> }

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
