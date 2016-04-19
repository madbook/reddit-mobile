import React from 'react';
import { models } from '@r/api-client';
import without from 'lodash/array/without';

import mobilify from '../../../lib/mobilify';
import { SORTS } from '../../../sortValues';
import extractErrorMsg from '../../../lib/extractErrorMsg';
import BaseComponent from '../BaseComponent';
import CommentHeader from './CommentHeader';
import CommentTools from './CommentTools';
import CommentReplyForm from './CommentReplyForm';
import CommentSeeMore from './CommentSeeMore';
import CommentEditForm from './CommentEditForm';

const T = React.PropTypes;

function determineVoteDirection(likes) {
  if (likes === true) { return 1; }
  if (likes === false) { return -1; }
  return 0;
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

export default class Comment extends BaseComponent {
  static propTypes = {
    parentCreated: T.number,
    postCreated: T.number,
    comment: T.object.isRequired,
    apiOptions: T.object.isRequired,
    app: T.object.isRequired,
    ctx: T.object.isRequired,
    user: T.object,
    sort: T.string,
    token: T.string,
    op: T.string,
    nestingLevel: T.number,
    permalinkBase: T.string,
    repliesLocked: T.bool,
    highlightedComment: T.string,
  };

  static defaultProps = {
    sort: SORTS.CONFIDENCE,
    nestingLevel: 0,
    repliesLocked: false,
    highlightedComment: '',
  };

  constructor(props) {
    super(props);

    const { comment } = props;

    this.state = {
      comment: props.comment, // set as state since editing can change this
      commentScore: comment.score,
      commentReplies: comment.replies || [],
      commentDeleted: comment.author === '[deleted]', // there has GOT to be a better way
      collapsed: false,
      showReplyBox: false,
      replyBoxContent: '',
      replyBoxError: '',
      voteDirection: determineVoteDirection(comment.likes),
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

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleReplyForm = this.toggleReplyForm.bind(this);
    this.toggleEditForm = this.toggleEditForm.bind(this);
    this.submitReply = this.submitReply.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.handleDownvote = this.handleDownvote.bind(this);
    this.handleReplyBoxContent = this.handleReplyBoxContent.bind(this);
    this.loadMoreComments = this.loadMoreComments.bind(this);
    this.renderReply = this.renderReply.bind(this);
    this.submitCommentEdit = this.submitCommentEdit.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.reportComment = this.reportComment.bind(this);
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

  handleUpvote() {
    this.submitVote(1);
  }

  handleDownvote() {
    this.submitVote(-1);
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

  buildApiOptions() {
    return this.props.app.api.buildOptions(this.props.apiOptions);
  }

  async submitReply() {
    const { app } = this.props;
    const { waitingForRequest } = this.state;

    if (this.props.app.needsToLogInUser() || waitingForRequest) { return; }
    this.setState({ waitingForRequest: true });

    try {
      const options = {
        ...this.buildApiOptions(),
        model: new models.Comment({
          thingId: this.state.comment.name,
          text: this.state.replyBoxContent.trim(),
        }),
      };

      const newComment = await app.api.comments.post(options);

      app.emit('comment:new', {
        ...this.props,
        comment: newComment,
      });

      this.setState({
        commentReplies: [newComment].concat(this.state.commentReplies),
        showReplyBox: false,
        replyBoxError: '',
        replyBoxContent: '',
        waitingForRequest: false,
      });
    } catch (e) {
      this.setState({
        replyBoxError: extractErrorMsg(e),
        waitingForRequest: false,
      });
    }
  }

  async submitVote(delta) {
    if (this.props.app.needsToLogInUser()) { return; }

    const currentScore = this.state.commentScore;
    const currentVoteDirection = this.state.voteDirection;

    try {
      const undoVote = (delta - currentVoteDirection) === 0;
      const newVoteDirection = undoVote ? 0 : delta;
      const vote = this.buildVote(newVoteDirection);

      // In determining the new score:
      // 1) If we are undoing a vote we want to remove (read: subtract) it from
      //    the comment score
      // 2) If we are not undoing, we need to account for any existing vote by
      //    first removing it (ie, subtract) before 'adding' the new vote
      const newScore = undoVote
        ? currentScore - delta
        : currentScore - currentVoteDirection + delta;

      this.setState({
        voteDirection: newVoteDirection,
        commentScore: newScore,
      });

      this.props.app.emit('vote', vote);
      await this.props.app.api.votes.post({
        ...this.buildApiOptions(),
        model: vote,
        type: this.state.comment._type,
        score: newScore,
      });
    } catch (e) {
      // undo any optimistic UI updates
      if (this.state.commentScore !== currentScore) {
        this.props.app.emit('vote', this.buildVote(currentVoteDirection));

        this.setState({
          voteDirection: currentVoteDirection,
          commentScore: currentScore,
        });
      }
    }
  }

  async loadMoreComments(commentStub) {
    if (this.state.loadingMoreComments) { return; }

    this.setState({
      loadingMoreComments: true,
    });

    try {
      const response = await this.props.app.api.comments.get({
        ...this.buildApiOptions(),
        query: { ids: commentStub.children },
        linkId: this.state.comment.link_id,
        sort: this.props.sort,
      });

      const newComments = response.body;
      this.setState({
        commentReplies: without(this.state.commentReplies, commentStub).concat(newComments),
        loadingMoreComments: false,
      });
    } catch (e) {
      this.setState({
        loadingMoreComments: false,
      });
    }
  }

  async submitCommentEdit(newCommentText) {
    const { waitingForRequest } = this.state;
    if (this.props.app.needsToLogInUser() || waitingForRequest) { return; }
    this.setState({ waitingForRequest: true });

    try {
      const options = {
        ...this.buildApiOptions(),
        model: new models.Comment(this.state.comment),
        changeSet: newCommentText.trim(),
      };

      const newData = await this.props.app.api.comments.patch(options);

      // we need to manually set an error if there is no data. this is because
      // the api will return a 200 even if there was a failure.
      if (newData) {
        this.setState({
          comment: {
            ...newData,
            replies: this.state.commentReplies,
          },
          editing: false,
          waitingForRequest: false,
        });

        this.props.app.emit('comment:edit');
      } else {
        throw new Error('Sorry, there was a problem');
      }
    } catch (e) {
      this.setState({
        waitingForRequest: false,
        editingError: extractErrorMsg(e),
      });
    }
  }

  async deleteComment() {
    const { waitingForRequest } = this.state;
    if (this.props.app.needsToLogInUser() || waitingForRequest) { return; }
    this.setState({ waitingForRequest: true });

    try {
      const options = {
        ...this.buildApiOptions(),
        id: this.state.comment.name,
      };

      await this.props.app.api.comments.delete(options);

      this.setState({
        comment: {
          ...this.state.comment,
          body_html: '<p>[deleted]</p>',
          author: '[deleted]',
        },
        commentDeleted: true,
        waitingForRequest: false,
      });
    } catch (e) {
      this.setState({
        waitingForRequest: false,
        editingError: extractErrorMsg(e),
      });
    }
  }

  async saveComment() {
    const { waitingForRequest } = this.state;
    if (waitingForRequest) { return; }
    this.setState({ waitingForRequest: true });

    try {
      const options = {
        ...this.buildApiOptions(),
        id: this.state.comment.name,
        type: this.state.comment._type.toLowerCase(),
      };

      if (this.state.comment.saved) {
        await this.props.app.api.saved.delete(options);
        this.setState({
          comment: {
            ...this.state.comment,
            saved: false,
          },
          waitingForRequest: false,
        });
      } else {
        await this.props.app.api.saved.post(options);
        this.setState({
          comment: {
            ...this.state.comment,
            saved: true,
            waitingForRequest: false,
          },
        });
      }
    } catch (e) {
      // Do nothing
    }
  }

  async reportComment(reportReason) {
    if (this.props.app.needsToLogInUser()) { return; }

    try {
      const options = {
        ...this.buildApiOptions(),
        model: new models.Report({
          thing_id: this.state.comment.name,
          reason: 'other',
          other_reason: reportReason,
        }),
      };

      await this.props.app.api.reports.post(options);

      this.props.app.emit('report', this.state.comment.id);
    } catch (e) {
      // do nothing;
    }
  }

  render() {
    const { commentReplies, editing, commentDeleted, collapsed, showReplyBox } = this.state;

    return (
      <div className='Comment'>
        { this.renderHeader() }
        { editing ? this.renderEditForm() : this.renderBody() }
        { !commentDeleted ? this.renderTools() : null }
        { !collapsed && showReplyBox ? this.renderReplyArea() : null }
        { commentReplies.length ? this.renderReplies() : null }
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
    const { collapsed, comment } = this.state;
    const bodyText = mobilify(comment.body_html);

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
    const { nestingLevel } = this.props;
    const { commentReplies, collapsed } = this.state;

    let cls = 'Comment__replies';
    if (collapsed) { cls += ' m-hidden'; }
    if (nestingLevel > 5) { cls += ' m-no-indent'; }

    return (
      <div className={ cls }>
        { commentReplies.map(this.renderReply) }
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
            app={ this.props.app }
            ctx={ this.props.ctx }
            sort={ this.props.sort }
            token={ this.props.token }
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
