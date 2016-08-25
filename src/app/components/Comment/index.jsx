import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';

import mobilify from 'lib/mobilify';

import * as commentActions from 'app/actions/comment';

import CommentsList from 'app/components/CommentsList';

import CommentHeader from './CommentHeader';
import CommentTools from './CommentTools';
import CommentReplyForm from './CommentReplyForm';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

// import CommentSeeMore from './CommentSeeMore';
// import CommentEditForm from './CommentEditForm';

const T = React.PropTypes;
const { CommentModel } = models;

const collapsible = props => !(props.preview || props.userActivityPage);
const collapsed = props => props.commentCollapsed && collapsible(props);

export function Comment (props) {
  const { isEditing, preview, userActivityPage } = props;

  return (
    <div className={ `Comment ${!preview ? 'in-comment-tree' : ''}` }>
      { renderHeader(props) }
      { isEditing ? renderEditForm(props) : renderBody(props) }
      { !userActivityPage ? renderFooter(props) : null }
    </div>
  );
}

function renderFooter(props) {
  const {
    commentDeleted,
    commentReplying,
    commentingDisabled,
    commentCollapsed,
    comment,
    preview,
  } = props;

  return [
    !commentDeleted ? renderTools(props) : null,
    !preview && commentReplying && !commentingDisabled ? renderCommentReply(props) : null,
    !preview && !commentCollapsed && comment.replies.length ? renderReplies(props) : null,
  ];
}

function determineAuthorType(distinguished, author, op, user) {
  if (distinguished) {
    return distinguished;
  } else if (user && user.name === author) {
    return 'self';
  } else if (author === op) {
    return 'op';
  }

  return '';
}

function renderHeader(props) {
  const { nestingLevel, highlightedComment, comment, commentCollapsed, op, user } = props;
  const authorType = determineAuthorType(
    comment.distinguished,
    comment.author,
    op,
    user ? user.name : '',
  );

  // don't allow comment collapsing on user activity and preview pages
  const onToggleCollapse = () => {
    if (!collapsible(props)) { return; }
    props.toggleCollapse(!commentCollapsed);
  };

  return (
    <div className='Comment__header' id={ comment.id }>
      <CommentHeader
        id={ comment.id }
        author={ comment.author }
        authorType={ authorType }
        topLevel={ nestingLevel === 0 && collapsible(props) }
        dots={ Math.max(nestingLevel - 6, 0) }
        flair={ comment.authorFlairText }
        created={ comment.createdUTC }
        gildCount={ comment.gilded }
        collapsed={ collapsed(props) }
        highlight={ comment.id === highlightedComment }
        stickied={ comment.stickied }
        onToggleCollapse={ onToggleCollapse }
      />
    </div>
  );
}

function renderEditForm() {
  return;
}

function renderBody(props) {
  const { comment, commentCollapsed, userActivityPage } = props;
  const bodyText = mobilify(comment.bodyHTML);

  let cls = 'Comment__body';
  if (commentCollapsed && !userActivityPage) { cls += ' m-hidden'; }

  return (
    <RedditLinkHijacker>
      <div
        className={ cls }
        dangerouslySetInnerHTML={ { __html: bodyText } }
      />
    </RedditLinkHijacker>
  );
}

function renderTools(props) {
  const {
    user,
    comment,
    commentCollapsed,
    currentPage,
    commentReplying,
    onToggleEditForm,
    onDeleteComment,
    onToggleSaveComment,
    commentingDisabled,
    votingDisabled,
  } = props;

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
          currentPage = { currentPage }
          replying={ commentReplying }
          permalinkUrl={ comment.cleanPermalink }
          onEdit={ onToggleEditForm }
          onDelete={ onDeleteComment }
          onToggleSave={ onToggleSaveComment }
          commentingDisabled={ commentingDisabled }
          votingDisabled={ votingDisabled }
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

function renderCommentReply(props) {
  const { savedReplyContent, comment, currentPage } = props;
  return (
    <CommentReplyForm
      currentPage={ currentPage }
      parentId={ comment.name }
      savedReply={ savedReplyContent }
    />
  );
}

function renderReplies(props) {
  const { op, nestingLevel, comment, commentCollapsed } = props;

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
        op={ op }
        commentRecords={ comment.replies }
        parentComment={ comment }
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
  repliesLocked: T.bool,
  highlightedComment: T.string,
  isEditing: T.bool,
  onToggleSaveComment: T.func,
};

Comment.defaultProps = {
  nestingLevel: 0,
  repliesLocked: false,
  highlightedComment: '',
  isEditing: false,
  onToggleSaveComment: () => {},
};

const commentIdSelector = (state, props) => props.commentId;
const commentModelSelector = (state, props) => state.comments[props.commentId];
const parentCommentSelector = (state, props) => props.parentComment;
const postCreatedSelector = (state, props) => props.postCreated;
const userSelector = state => state.user;
const nestingLevelSelector = (state, props) => props.nestingLevel;
const commentCollapsedSelector = (state, props) => state.collapsedComments[props.commentId];
const currentPageSelector = (state) => state.platform.currentPage;
const commentingDisabledSelector = (state) => {
  const postId = `t3_${state.platform.currentPage.urlParams.postId}`;
  const post = state.posts[postId];
  return post ? (post.archived || post.locked) : true;
};
const votingDisabledSelector = (state) => {
  const postId = `t3_${state.platform.currentPage.urlParams.postId}`;
  const post = state.posts[postId];
  return post ? (post.archived) : true;
};
const commentReplyingSelector = (state, props) =>
  state.platform.currentPage.queryParams.commentReply === props.commentId;
const commentEditingSelector = (state, props) => state.editingComment === props.commentId;
const highlightedCommentSelector = state =>
  state.platform.currentPage.urlParams.commentId;

const combineSelectors = (
  commentId,
  comment,
  parentComment,
  postCreated,
  user,
  nestingLevel,
  commentCollapsed,
  currentPage,
  commentingDisabled,
  votingDisabled,
  commentReplying,
  isEditing,
  highlightedComment,
) => ({
  commentId,
  comment,
  parentComment,
  postCreated,
  user,
  nestingLevel,
  commentCollapsed,
  currentPage,
  commentingDisabled,
  votingDisabled,
  commentReplying,
  isEditing,
  highlightedComment,
});

const makeConnectedCommentSelector = () => {
  return createSelector(
    [
      commentIdSelector,
      commentModelSelector,
      parentCommentSelector,
      postCreatedSelector,
      userSelector,
      nestingLevelSelector,
      commentCollapsedSelector,
      currentPageSelector,
      commentingDisabledSelector,
      votingDisabledSelector,
      commentReplyingSelector,
      commentEditingSelector,
      highlightedCommentSelector,
    ],
    combineSelectors,
  );
};

const mapDispatchToProps = (dispatch, { commentId }) => ({
  toggleCollapse: (collapse) => dispatch(commentActions.toggleCollapse(commentId, collapse)),
  onToggleEditForm: () => dispatch(commentActions.toggleEditForm(commentId)),
  onDeleteComment: () => dispatch(commentActions.del(commentId)),
  onToggleSaveComment: () => dispatch(commentActions.toggleSave(commentId)),
  reportComment: (reason) => dispatch(commentActions.report(commentId, reason)),
  loadMore: (ids) => dispatch(commentActions.loadMore(ids)),
});

export default connect(makeConnectedCommentSelector, mapDispatchToProps)(Comment);
