import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import CommentsList from '../components/CommentsList/CommentsList';
import Post from '../components/Post/Post';

import CommentsPageHandler from '../router/handlers/CommentsPageHandler';
import { paramsToCommentsPageId } from '../models/CommentsPageModel';

const commentsPageSelector = createSelector(
  (state, props) => props,
  (state, /*props*/) => state.commentsPages,
  (state, /*props*/) => state.comments,
  (pageProps, commentsPages/*, commentsStore*/) => {
    const commentsPageParams = CommentsPageHandler.PageParamsToCommentsPageParams(pageProps);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const commentsPage = commentsPages[commentsPageId];
    const topLevelComments = (!commentsPage || commentsPage.loading)
      ? []
      : commentsPage.results;

    const permalinkBase = pageProps.url;

    return {
      commentsPageParams,
      commentsPage,
      commentsPageId,
      permalinkBase,
      topLevelComments,
    };
  },
);

export const CommentsPage = connect(commentsPageSelector)((props) => {
  const { commentsPage, commentsPageParams, topLevelComments, permalinkBase } = props;

  return (
    <div className='CommentsPage'>
      <Post postId={ commentsPageParams.id } single={ true } />
      { !commentsPage || commentsPage.loading ?
        <div className='CommentsPage__loading' /> :
        <CommentsList
          commentRecords={ topLevelComments }
          permalinkBase={ permalinkBase }
          className={ 'CommentsList__topLevel' }
        /> }
    </div>
  );
});
