import './Comment.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { models } from '@r/api-client';
import { without } from 'lodash/array';
import mobilify from '../../../lib/mobilify';

import extractErrorMsg from '../../../lib/extractErrorMsg';
import CommentsList from '../CommentsList/CommentsList';

// import CommentHeader from './CommentHeader';
// import CommentTools from './CommentTools';
// import CommentReplyForm from './CommentReplyForm';
// import CommentSeeMore from './CommentSeeMore';
// import CommentEditForm from './CommentEditForm';

const T = React.PropTypes;
const { CommentModel } = models;

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

export class Comment extends React.Component {
  static propTypes = {
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

  static defaultProps = {
    nestingLevel: 0,
    repliesLocked: false,
    highlightedComment: '',
  };

  constructor(props) {
    super(props);

    const { comment } = props;

    this.state = {
      commentScore: comment.score,
      commentDeleted: comment.author === '[deleted]', // there has GOT to be a better way
      collapsed: false,
      showReplyBox: false,
      replyBoxContent: '',
      replyBoxError: '',
      loadingMoreComments: false,
      editing: false,
      editingError: '',
      authorType: determineAuthorType(
        comment.distinguished,
        comment.author,
        props.op,
        props.user,
      ),
      waitingForRequest: false,
    };

    // this.toggleCollapse = this.toggleCollapse.bind(this);
    // this.toggleReplyForm = this.toggleReplyForm.bind(this);
    // this.toggleEditForm = this.toggleEditForm.bind(this);
    // this.submitReply = this.submitReply.bind(this);
    // this.handleUpvote = this.handleUpvote.bind(this);
    // this.handleDownvote = this.handleDownvote.bind(this);
    // this.handleReplyBoxContent = this.handleReplyBoxContent.bind(this);
    // this.loadMoreComments = this.loadMoreComments.bind(this);
    // this.renderReply = this.renderReply.bind(this);
    // this.submitCommentEdit = this.submitCommentEdit.bind(this);
    // this.deleteComment = this.deleteComment.bind(this);
    // this.saveComment = this.saveComment.bind(this);
    // this.reportComment = this.reportComment.bind(this);
  }

  toggleCollapse(e) {
    e.stopPropagation();

    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  toggleReplyForm() {
    if (this.props.app.needsToLogInUser()) { return; }

    this.setState({
      showReplyBox: !this.state.showReplyBox,
    });
  }

  toggleEditForm() {
    this.setState({
      editing: !this.state.editing,
    });
  }

  handleReplyBoxContent(replyText) {
    this.setState({
      replyBoxContent: replyText,
    });
  }

  buildVote(delta) {
    return new models.Vote({
      direction: delta,
      id: this.state.comment.name,
    });
  }

  render() {
    const { comment } = this.props;
    const { editing, commentDeleted, collapsed, showReplyBox } = this.state;

    return (
      <div className='Comment'>
        {/*{ this.renderHeader() }*/}
        { editing ? this.renderEditForm() : this.renderBody() }
        {/*{ !commentDeleted ? this.renderTools() : null }*/}
        {/*{ !collapsed && showReplyBox ? this.renderReplyArea() : null }*/}
        { !collapsed && comment.replies.length ? this.renderReplies() : null }
      </div>
    );
  }

  renderHeader() {
    const { nestingLevel, highlightedComment } = this.props;
    const { collapsed, authorType, comment } = this.state;

    return (
      <div className='Comment__header' onClick={ this.toggleCollapse } >
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

  renderEditForm() {
    const { collapsed, editingError, comment } = this.state;

    let cls = 'Comment__edit';
    if (collapsed) { cls += ' m-hidden'; }

    return (
      <div className={ cls }>
        <CommentEditForm
          content={ comment.body }
          error={ editingError }
          onClose={ this.toggleEditForm }
          onSubmit={ this.submitCommentEdit }
        />
      </div>
    );
  }

  renderBody() {
    const { comment } = this.props;
    const { collapsed } = this.state;
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

  renderTools() {
    const { user, permalinkBase } = this.props;
    const { commentScore, voteDirection, collapsed, comment } = this.state;

    let cls = 'Comment__toolsContainer clearfix';
    if (collapsed) { cls += ' m-hidden'; }

    return (
      <div className={ cls }>
        <div className='Comment__tools'>
          <CommentTools
            score={ commentScore }
            scoreHidden={ comment.score_hidden }
            voteDirection={ voteDirection }
            app={ this.props.app }
            commentAuthor={ comment.author }
            username={ user ? user.name : null }
            saved={ comment.saved }
            permalinkUrl={ `${permalinkBase}${comment.id}` }
            onToggleReplyForm={ this.toggleReplyForm }
            onEditComment={ this.toggleEditForm }
            onDeleteComment={ this.deleteComment }
            onSaveComment={ this.saveComment }
            onReportComment={ this.reportComment }
            onUpvote={ this.handleUpvote }
            onDownvote={ this.handleDownvote }
          />
        </div>
      </div>
    );
  }

  renderReplyArea() {
    const { repliesLocked } = this.state;

    return repliesLocked ? this.renderLockedReplyForm() : this.renderReplyForm();
  }

  renderReplyForm() {
    const { replyBoxError, replyBoxContent, waitingForRequest } = this.state;

    return (
      <div className='Comment__replyForm'>
        <CommentReplyForm
          onReplySubmit={ this.submitReply }
          onClose={ this.toggleReplyForm }
          onContentChange={ this.handleReplyBoxContent }
          buttonText='ADD COMMENT'
          error={ replyBoxError }
          value={ replyBoxContent }
          submitting={ waitingForRequest }
        />
      </div>
    );
  }

  renderLockedReplyForm() {
    return (
      <div className='Comment__replyForm'>
        <div className='Comment__replyFormLocked'>
          Comments are locked
        </div>
      </div>
    );
  }

  renderReplies() {
    const { nestingLevel, comment } = this.props;
    const { collapsed } = this.state;

    let cls = 'Comment__replies';
    if (collapsed) { cls += ' m-hidden'; }
    if (nestingLevel > 5) { cls += ' m-no-indent'; }

    return (
      <div className={ cls }>
        <CommentsList
          parentComment={ comment }
          nestingLevel={ nestingLevel }
          comments={ comment.replies }
        />
      </div>
    );
  }

  renderReply(reply) {
    const { loadingMoreComments } = this.state;
    const { nestingLevel, highlightedComment } = this.props;
    const replyCallback = () => this.loadMoreComments(reply);

    let cls = 'Comment__reply';
    if (reply.id === highlightedComment) { cls += ' m-highlight'; }

    if (reply && reply.body_html !== undefined) {
      return (
        <div className={ cls } key={ reply.id } >
          <Comment
            parentCreated={ this.state.comment.created }
            postCreated={ this.props.postCreated }
            comment={ reply }
            apiOptions={ this.props.apiOptions }
            op={ this.props.op }
            user={ this.props.user }
            nestingLevel={ nestingLevel + 1 }
            permalinkBase={ this.props.permalinkBase }
            repliesLocked={ this.props.repliesLocked }
            highlightedComment={ highlightedComment }
          />
        </div>
      );
    }

    return (
      <div className='Comment__seemore' key={ reply.id } >
        <CommentSeeMore
          count={ reply.count }
          isLoading={ loadingMoreComments }
          onLoadMore={ replyCallback }
          dots={ Math.max(nestingLevel - 6, 0) }
        />
      </div>
    );
  }
}

const commentSelector = createSelector(
  (state, props) => props,
  (state, props) => state.comments,
  (props, commentsStore) => {
    const commentId = props.commentId;
    const comment = commentsStore[commentId];
    const { parentCreated, postCreated, user, op, nestingLevel } = props;
    return { comment, parentCreated, postCreated, user, op, nestingLevel };
  },
);

export default connect(commentSelector)(Comment);
