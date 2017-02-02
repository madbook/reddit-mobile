import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';
import { Anchor } from '@r/platform/components';
import { toggleModal } from '@r/widgets/modal';
import includes from 'lodash/includes';

import mobilify from 'lib/mobilify';
import * as replyActions from 'app/actions/reply';
import * as commentActions from 'app/actions/comment';
import * as reportingActions from 'app/actions/reporting';
import { DEFAULT_COMMENT_REQUEST } from 'app/reducers/moreCommentsRequests';
import cx from 'lib/classNames';
import CommentsList from 'app/components/CommentsList';
import CommentHeader from './CommentHeader';
import CommentTools from './CommentTools';
import CommentReplyForm from './CommentReplyForm';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';
import EditForm from 'app/components/EditForm';


const T = React.PropTypes;

const LOAD_MORE_COMMENTS = 'More Comments';
const LOADING_MORE_COMMENTS = 'Loading...';
const NESTING_STOP_LEVEL = 6;

export function Comment(props) {
  const {
    comment,
    commentCollapsed,
    authorType,
    nestingLevel,
    preview,
    isTopLevel,
    isUserActivityPage,
    highlightedComment,
    onToggleCollapse,
    editing,
  } = props;

  const commentClasses = cx('Comment', { 'in-comment-tree': !preview, 'm-removed': comment.spam || comment.removed });
  const bodyClasses = cx('Comment__body', {
    'm-hidden': commentCollapsed && !isUserActivityPage,
  });

  return (
    <div className={ commentClasses }>
      <div className='Comment__header' id={ comment.id }>
        <CommentHeader
          id={ comment.id }
          author={ comment.author }
          authorType={ authorType }
          topLevel={ isTopLevel }
          dots={ Math.max(nestingLevel - NESTING_STOP_LEVEL, 0) }
          flair={ comment.authorFlairText }
          created={ comment.createdUTC }
          gildCount={ comment.gilded }
          collapsed={ commentCollapsed }
          highlight={ comment.id === highlightedComment }
          stickied={ comment.stickied }
          onToggleCollapse={ onToggleCollapse }
          isApproved={ comment.approved }
          isRemoved={ comment.removed }
          isSpam={ comment.spam }
        />
      </div>

      {
        editing
        ? renderEditForm(props)
        : (
          <RedditLinkHijacker>
            <div
              className={ bodyClasses }
              dangerouslySetInnerHTML={ { __html: mobilify(props.comment.bodyHTML) } }
            />
          </RedditLinkHijacker>
        )
      }

      { !isUserActivityPage ? renderFooter(props) : null }
    </div>
  );
}

function renderEditForm(props) {
  const {
    editPending,
    comment,
    onToggleEditForm,
    onUpdateBody,
  } = props;

  return (
    <EditForm
      startingText={ comment.bodyMD }
      editPending={ editPending }
      onCancelEdit={ onToggleEditForm }
      onSaveEdit={ onUpdateBody }
    />
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

  const { replies, loadMoreIds, canContinueThread } = comment;
  const showReplies = replies.length || loadMoreIds || canContinueThread;

  return [
    !commentDeleted ? renderTools(props) : null,
    !preview && commentReplying && !commentingDisabled ? renderCommentReply(props) : null,
    !preview && !commentCollapsed && showReplies ? renderReplies(props) : null,
  ];
}


function renderTools(props) {
  const {
    user,
    comment,
    commentCollapsed,
    commentReplying,
    onToggleEditForm,
    onDeleteComment,
    onToggleSaveComment,
    onReportComment,
    onToggleReply,
    commentingDisabled,
    votingDisabled,
    onToggleModal,
    moderatingSubreddits,
  } = props;

  const className = cx('Comment__toolsContainer', 'clearfix', {
    'm-hidden': commentCollapsed,
  });

  const isSubredditModerator = includes(moderatingSubreddits.names, comment.subreddit.toLowerCase());

  return (
    <div className={ className }>
      <div className='Comment__tools'>
        <CommentTools
          id={ comment.name }
          score={ comment.score }
          scoreHidden={ comment.scoreHidden }
          voteDirection={ comment.likes }
          commentAuthor={ comment.author }
          username={ user ? user.name : null }
          saved={ comment.saved }
          replying={ commentReplying }
          permalinkUrl={ comment.cleanPermalink }
          onEdit={ onToggleEditForm }
          onDelete={ onDeleteComment }
          onToggleSave={ onToggleSaveComment }
          onReportComment={ onReportComment }
          onToggleReply={ onToggleReply }
          commentingDisabled={ commentingDisabled }
          votingDisabled={ votingDisabled }
          onToggleModal={ onToggleModal }
          isSubredditModerator={ isSubredditModerator }
          isSpam={ comment.spam }
          isRemoved={ comment.removed }
          isApproved={ comment.approved }
          approvedBy={ comment.approvedBy }
          removedBy={ comment.bannedBy }
          isMine={ user && user.name === comment.author }
          distinguishType={ comment.distinguished }
        />
      </div>
    </div>
  );
}


function renderCommentReply(props) {
  const { comment, onToggleReply } = props;
  return (
    <CommentReplyForm
      onToggleReply= { onToggleReply }
      parentId={ comment.name }
    />
  );
}


function renderReplies(props) {
  const { comment, nestingLevel, commentCollapsed } = props;
  const { replies, loadMore, canContinueThread } = comment;

  const className = cx('Comment__replies', {
    'm-hidden': commentCollapsed,
    'm-no-indent': nestingLevel >= NESTING_STOP_LEVEL,
  });

  return (
    <div className={ className }>
      { replies.length ? renderCommentsList(props) : null }
      { loadMore && !canContinueThread ? renderMoreCommentsButton(props) : null }
      { canContinueThread ? renderContinueThread(props) : null }
    </div>
  );
}

function renderCommentsList(props) {
  return (
    <CommentsList
      commentRecords={ props.comment.replies }
      parentComment={ props.comment }
      nestingLevel={ props.nestingLevel + 1 }
      op={ props.op }
      votingDisabled={ props.votingDisabled }
    />
  );
}

function renderMoreCommentsButton(props) {
  const { comment, moreCommentStatus, onLoadMore } = props;

  const loadingText = moreCommentStatus.loading
    ? LOADING_MORE_COMMENTS
    : `${LOAD_MORE_COMMENTS} (${comment.numReplies})`;

  return (
    <div className='Comment__loadMore' onClick={ onLoadMore }>
      <div className='icon icon-caron-circled' />
      <span className='Comment__loadMore-text'>{ loadingText }</span>
    </div>
  );
}

function renderContinueThread(props) {
  const { comment, nestingLevel } = props;

  const className = cx('Comment__continueThread', {
    'm-no-indent': nestingLevel >= NESTING_STOP_LEVEL,
  });

  return (
    <div className={ className }>
      <div className='icon icon-caron-circled' />
      <Anchor href={ comment.cleanPermalink }>Continue this thread</Anchor>
    </div>
  );
}


Comment.propTypes = {
  // start props passed in via state selector
  comment: T.instanceOf(models.CommentModel).isRequired,
  commentReplying: T.bool.isRequired,
  currentPage: T.object.isRequired,
  highlightedComment: T.string,
  moreCommentStatus: T.object.isRequired,
  user: T.object.isRequired,
  editing: T.bool.isRequired,
  editPending: T.bool.isRequired,
  votingDisabled: T.bool,
  // start props passed in via dispatch selector
  onDeleteComment: T.func.isRequired,
  onToggleEditForm: T.func.isRequired,
  onUpdateBody: T.func.isRequired,
  onToggleSaveComment: T.func.isRequired,
  onReportComment: T.func.isRequired,
  onToggleReply: T.func.isRequired,
  reportComment: T.func.isRequired,
  // start props passed in via merge selector
  authorType: T.string.isRequired,
  commentCollapsed: T.bool.isRequired,
  isTopLevel: T.bool.isRequired,
  onLoadMore: T.func.isRequired,
  onToggleCollapse: T.func.isRequired,
  // start props passed in via parent component
  commentId: T.string.isRequired,
  nestingLevel: T.number,
  op: T.string,
  preview: T.bool,
  isUserActivityPage: T.bool,
};


Comment.defaultProps = {
  authorType: '',
  highlightedComment: '',
  nestingLevel: 0,
  op: null,
  preview: false,
  votingDisabled: false,
};


const selector = createSelector(
  state => state.user,
  state => state.platform.currentPage,
  (state, props) => state.comments[props.commentId],
  (state, props) => state.moreCommentsRequests[props.commentId] || DEFAULT_COMMENT_REQUEST,
  (state, props) => !!state.collapsedComments[props.commentId],
  (state, props) => !!state.replying[props.commentId],
  (state, props) => state.editingText[props.commentId],
  state => state.moderatingSubreddits,
  (
    user,
    currentPage,
    comment,
    moreCommentStatus,
    commentCollapsed,
    commentReplying,
    editingState,
    moderatingSubreddits,
  ) => {
    const editing = !!editingState;
    const editPending = editing && editingState.pending;
    const editError = editing ? editingState.error : null;

    return {
      user,
      currentPage,
      comment,
      commentCollapsed,
      commentReplying,
      editing,
      editPending,
      editError,
      moreCommentStatus,
      highlightedComment: currentPage.urlParams.commentId,
      moderatingSubreddits,
    };
  },
);


const mapDispatchToProps = (dispatch, { commentId }) => ({
  onToggleEditForm: () => dispatch(commentActions.toggleEdit(commentId)),
  onUpdateBody: (newBodyText) => dispatch(commentActions.updateBody(commentId, newBodyText)),
  onDeleteComment: () => dispatch(commentActions.del(commentId)),
  onToggleSaveComment: () => dispatch(commentActions.toggleSave(commentId)),
  reportComment: reason => dispatch(reportingActions.report(commentId, reason)),
  onLoadMore: comment => dispatch(commentActions.loadMore(comment)),
  onToggleCollapse: commentCollapsed => dispatch(commentActions.toggleCollapse(commentId, !commentCollapsed)),
  onReportComment: () => dispatch(reportingActions.report(commentId)),
  onToggleReply: (e) => {
    e.preventDefault();
    dispatch(replyActions.toggle(commentId));
  },
  onToggleModal: () => dispatch(toggleModal(null)),
});


function determineAuthorType(comment, user, op) {
  if (comment.distinguished) {
    return comment.distinguished;
  } else if (user && user.name === comment.author) {
    return 'self';
  } else if (comment.author === op) {
    return 'op';
  }

  return '';
}


const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { comment, user, commentCollapsed } = stateProps;
  const isCollapsible = !ownProps.preview && !ownProps.isUserActivityPage;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    commentCollapsed: isCollapsible && stateProps.commentCollapsed,
    isTopLevel: isCollapsible && ownProps.nestingLevel === 0,
    authorType: determineAuthorType(comment, user, ownProps.op),
    onLoadMore: () => dispatchProps.onLoadMore(comment),
    onToggleCollapse: () => {
      if (isCollapsible) {
        dispatchProps.onToggleCollapse(commentCollapsed);
      }
    },
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(Comment);
