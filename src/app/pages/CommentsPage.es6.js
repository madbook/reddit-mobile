import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import CommentsList from '../components/commentsList/CommentsList';
import Post from '../components/Post/Post';

import CommentsPageHandler from '../router/handlers/CommentsPageHandler';
import { paramsToCommentsPageId } from '../models/CommentsPageModel';

export const CommentsPage = (props) => {
  const commentsPageParams = CommentsPageHandler.PageParamsToCommentsPageParams(props);
  const commentsPageId = paramsToCommentsPageId(commentsPageParams);

  return (
    <div className='CommentsPage'>
      <Post postId={ commentsPageParams.id } single={ true } />
      <CommentsList commentsPageId={ commentsPageId } />
    </div>
  );
};
