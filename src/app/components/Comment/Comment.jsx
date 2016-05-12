import './Comment.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { models } from '@r/api-client';

import mobilify from '../../../lib/mobilify';

import * as commentActions from '../../actions/comment';

import CommentsList from '../CommentsList/CommentsList';

import CommentHeader from './CommentHeader/CommentHeader';
import CommentTools from './CommentTools/CommentTools';


// import CommentReplyForm from './CommentReplyForm';
// import CommentSeeMore from './CommentSeeMore';
// import CommentEditForm from './CommentEditForm';

const T = React.PropTypes;
const { CommentModel } = models;

export function Comment (props) {
  const { comment, editing, commentDeleted, commentCollapsed } = props;

  return (
    <div className='Comment'>
      { renderHeader(props) }
      { editing ? renderEditForm(props) : renderBody(props) }
      { !commentDeleted ? renderTools(props) : null }
      { !commentCollapsed && comment.replies.length ? renderReplies(props) : null }
    </div>
  );
}

function renderHeader(props) {
  const { nestingLevel, highlightedComment, comment, commentCollapsed, authorType } = props;

  return (
    <div className='Comment__header'>
      <CommentHeader
        id={ comment.id }
        author={ comment.author }
        authorType={ authorType }
        topLevel={ nestingLevel === 0 }
        dots={ Math.max(nestingLevel - 6, 0) }
        flair={ comment.author_flair_text }
        created={ comment.createdUTC }
        gildCount={ comment.gilded }
        collapsed={ commentCollapsed }
        highlight={ comment.id === highlightedComment }
        stickied={ comment.stickied }
        onToggleCollapse={ () => props.toggleCollapse(!commentCollapsed) }
      />
    </div>
  );
}

function renderEditForm() {
  return;
}

function renderBody(props) {
  const { comment, commentCollapsed } = props;
  const bodyText = mobilify(comment.bodyHTML);

  let cls = 'Comment__body';
  if (commentCollapsed) { cls += ' m-hidden'; }

  return (
    <div
      className={ cls }
      dangerouslySetInnerHTML={ { __html: bodyText } }
    />
  );
}

function renderTools(props) {
  const { user, permalinkBase, comment, commentCollapsed } = props;

  let cls = 'Comment__toolsContainer clearfix';
  if (commentCollapsed) { cls += ' m-hidden'; }

  return (
    <div className={ cls }>
      <div className='Comment__tools'>
        <CommentTools
          id={ comment.name }
          score={ comment.score }
          scoreHidden={ comment.scoreHidden }
          voteDirection={ comment.likes }
          commentAuthor={ comment.author }
          username={ user ? user.name : null }
          saved={ comment.saved }
          permalinkUrl={ `${permalinkBase}${comment.id}` }
          onToggleReplyForm={ props.toggleReplyForm }
          onEditComment={ props.toggleEditForm }
          onDeleteComment={ props.deleteComment }
          onSaveComment={ props.saveComment }
          onReportComment={ props.reportComment }
        />
      </div>
    </div>
  );
}

function handleLoadMore(fn, id) {
  return () => { fn(id); };
}

function renderLoadMore ({ numReplies, loadMore, permalink, id }, onLoadMore) {
  if (!loadMore) { return; }

  return (
    <div className='Comment__loadMore'>
      <a href={ permalink } onClick={ handleLoadMore(onLoadMore, id) }>
        { 'More Comments ' }
        { numReplies ? ` (${numReplies})` : '' }
      </a>
    </div>
  );
}

function renderReplies(props) {
  const { nestingLevel, comment, permalinkBase, commentCollapsed } = props;

  let cls = 'Comment__replies';
  if (commentCollapsed) { cls += ' m-hidden'; }
  if (nestingLevel > 5) { cls += ' m-no-indent'; }

  if (nestingLevel > 100) {
    return (
      <div className='see-more-comment'>See More Placeholder</div>
    );
  }

  return (
    <div className={ cls }>
      <CommentsList
        commentRecords={ comment.replies }
        parentComment={ comment }
        permalinkBase={ permalinkBase }
        nestingLevel={ nestingLevel + 1 }
      />
      { renderLoadMore(comment, props.loadMore) }
    </div>
  );
}

Comment.propTypes = {
  parentCreated: T.number,
  postCreated: T.number,
  comment: T.instanceOf(CommentModel),
  user: T.object,
  op: T.string,
  nestingLevel: T.number,
  permalinkBase: T.string,
  repliesLocked: T.bool,
  highlightedComment: T.string,
};

Comment.defaultProps = {
  nestingLevel: 0,
  repliesLocked: false,
  highlightedComment: '',
};

const commentIdSelector = (state, props) => props.commentId;
const commentModelSelector = (state, props) => state.comments[props.commentId];
const parentCommentSelector = (state, props) => props.parentComment;
const postCreatedSelector = (state, props) => props.postCreated;
const userSelector = (state, props) => props.user;
const nestingLevelSelector = (state, props) => props.nestingLevel;
const commentCollapsedSelector = (state, props) => state.collapsedComments[props.commentId];

const combineSelectors = (
  commentId, comment, parentComment, postCreated, user, nestingLevel, commentCollapsed) => ({
    commentId, comment, parentComment, postCreated, user, nestingLevel, commentCollapsed,
  });

const makeConnectedCommentSelector = () => {
  return createSelector([
    commentIdSelector,
    commentModelSelector,
    parentCommentSelector,
    postCreatedSelector,
    userSelector,
    nestingLevelSelector,
    commentCollapsedSelector,
  ],
  combineSelectors,
  );
};

const mapDispatchToProps = (dispatch, { commentId }) => ({
  toggleCollapse: (collapse) => dispatch(commentActions.toggleCollapse(commentId, collapse)),
  toggleReplyForm: () => dispatch(commentActions.toggleReplyForm(commentId)),
  toggleEditForm: () => dispatch(commentActions.toggleEditForm(commentId)),
  deleteComment: () => dispatch(commentActions.del(commentId)),
  saveComment: () => dispatch(commentActions.save(commentId)),
  reportComment: (reason) => dispatch(commentActions.report(commentId, reason)),
  loadMore: (ids) => dispatch(commentActions.loadMore(ids)),
});

export default connect(makeConnectedCommentSelector, mapDispatchToProps)(Comment);
