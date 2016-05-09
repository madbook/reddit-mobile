import './Comment.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { models } from '@r/api-client';
import mobilify from '../../../lib/mobilify';

import CommentsList from '../CommentsList/CommentsList';

import CommentHeader from './CommentHeader/CommentHeader';
import CommentTools from './CommentTools/CommentTools';
// import CommentReplyForm from './CommentReplyForm';
// import CommentSeeMore from './CommentSeeMore';
// import CommentEditForm from './CommentEditForm';

const T = React.PropTypes;
const { CommentModel } = models;

export function Comment (props) {
  const { comment, editing, commentDeleted, collapsed } = props;

  return (
    <div className='Comment'>
      { renderHeader(props) }
      { editing ? renderEditForm(props) : renderBody(props) }
      { !commentDeleted ? renderTools(props) : null }
      { !collapsed && comment.replies.length ? renderReplies(props) : null }
    </div>
  );
}


function toggleCollapse () {
  console.log('clicked collapse');
}

function renderHeader(props) {
  const { nestingLevel, highlightedComment, comment, collapsed, authorType } = props;

  return (
    <div className='Comment__header' onClick={ toggleCollapse } >
      <CommentHeader
        author={ comment.author }
        authorType={ authorType }
        topLevel={ nestingLevel === 0 }
        dots={ Math.max(nestingLevel - 6, 0) }
        flair={ comment.author_flair_text }
        created={ comment.created_utc }
        gildCount={ comment.gilded }
        collapsed={ collapsed }
        highlight={ comment.id === highlightedComment }
        stickied={ comment.stickied }
      />
    </div>
  );
}

function renderEditForm() {
  return;
}

function renderBody(props) {
  const { comment, collapsed } = props;
  const bodyText = mobilify(comment.bodyHTML);

  let cls = 'Comment__body';
  if (collapsed) { cls += ' m-hidden'; }

  return (
    <div
      className={ cls }
      dangerouslySetInnerHTML={ { __html: bodyText } }
    />
  );
}

function renderTools(props) {
  const { user, permalinkBase, comment, collapsed } = props;

  let cls = 'Comment__toolsContainer clearfix';
  if (collapsed) { cls += ' m-hidden'; }

  return (
    <div className={ cls }>
      <div className='Comment__tools'>
        <CommentTools
          score={ comment.score }
          scoreHidden={ comment.scoreHidden }
          voteDirection={ comment.likes }
          commentAuthor={ comment.author }
          username={ user ? user.name : null }
          saved={ comment.saved }
          permalinkUrl={ `${permalinkBase}${comment.id}` }
          onToggleReplyForm={ toggleReplyForm }
          onEditComment={ toggleEditForm }
          onDeleteComment={ deleteComment }
          onSaveComment={ saveComment }
          onReportComment={ reportComment }
          onUpvote={ handleUpvote }
          onDownvote={ handleDownvote }
        />
      </div>
    </div>
  );
}

function renderLoadMore ({ numReplies, showLoadMore=loadMore, permalink }) {
  if (!showLoadMore) { return; }

  return (
    <div className='Comment__loadMore'>
      <a href={ permalink } onClick={ loadMore }>
        { 'More Comments ' }
        { numReplies ? ` (${numReplies})` : '' }
      </a>
    </div>
  );
}

function toggleReplyForm () { console.log('toggleReplyForm'); }
function toggleEditForm () { console.log('toggleEditForm'); }
function deleteComment () { console.log('deleteComment'); }
function saveComment () { console.log('saveComment'); }
function reportComment () { console.log('reportComment'); }
function handleUpvote () { console.log('handleUpvote'); }
function handleDownvote () { console.log('handleDownvote'); }
function loadMore () { console.log('loadMore'); }

function renderReplies(props) {
  const { nestingLevel, comment, permalinkBase, collapsed } = props;

  let cls = 'Comment__replies';
  if (collapsed) { cls += ' m-hidden'; }
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
      { renderLoadMore(comment) }
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

const combineSelectors = (commentId, comment, parentComment, postCreated, user, nestingLevel) => ({
  commentId, comment, parentComment, postCreated, user, nestingLevel,
});

const makeConnectedCommentSelector = () => {
  return createSelector([
    commentIdSelector,
    commentModelSelector,
    parentCommentSelector,
    postCreatedSelector,
    userSelector,
    nestingLevelSelector,
  ],
  combineSelectors,
  );
};

export default connect(makeConnectedCommentSelector)(Comment);
