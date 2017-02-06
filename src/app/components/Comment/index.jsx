import './styles.less';

import React from 'react';

import CommentModel from 'apiClient/models/CommentModel';
import mobilify from 'lib/mobilify';
import cx from 'lib/classNames';
import CommentHeader from './CommentHeader';
import CommentTools from './CommentTools';
import CommentReplyForm from './CommentReplyForm';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';
import EditForm from 'app/components/EditForm';

const T = React.PropTypes;

const COMMENT_UPDATE_KEYS = [
  'bodyHTML',
  'score',
  'isCollapsed',
  'saved',
  'spam',
  'removed',
];

export default class Comment extends React.Component {
  static propTypes = {
    comment: T.instanceOf(CommentModel).isRequired,
    commentReplying: T.bool.isRequired,
    highlightedComment: T.string,
    user: T.object.isRequired,
    editing: T.bool.isRequired,
    editPending: T.bool.isRequired,
    votingDisabled: T.bool,
    reports: T.object,
    // dispatchers
    onDeleteComment: T.func.isRequired,
    onToggleEditForm: T.func.isRequired,
    onUpdateBody: T.func.isRequired,
    onToggleSaveComment: T.func.isRequired,
    onReportComment: T.func.isRequired,
    onToggleReply: T.func.isRequired,
    onToggleCollapse: T.func.isRequired,
    // end dispatchers
    authorType: T.string.isRequired,
    isTopLevel: T.bool.isRequired,
    preview: T.bool, // indicates component is wrapped in a CommentPreview
    isUserActivityPage: T.bool,
    isSubredditModerator: T.bool,
    dotsNum: T.number,
  };

  static defaultProps = {
    authorType: '',
    highlightedComment: '',
    nestingLevel: 0,
    preview: false,
    votingDisabled: false,
    reports: {},
  };

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = Object.keys(this.props).some(key => {
      const prop = this.props[key];
      const nextProp = nextProps[key];
      if (typeof prop === 'function') {
        return false;
      }

      if (key === 'comment') {
        // we can't use === comparison on the comment model
        // so we whitelist changes to certain fields for component renders
        return !COMMENT_UPDATE_KEYS.every((key) => {
          return prop[key] === nextProp[key];
        });
      }

      return prop !== nextProp;
    });

    return shouldUpdate;
  }

  render() {
    const props = this.props;
    const {
      comment,
      commentCollapsed,
      authorType,
      preview,
      isTopLevel,
      isUserActivityPage,
      highlightedComment,
      onToggleCollapse,
      editing,
      dotsNum,
      reports,
    } = props;


    const commentClasses = cx('Comment', {
      'in-comment-tree': !preview,
      'm-removed': comment.spam || comment.removed,
    });
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
            dots={ dotsNum }
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
            reports={ reports[comment.name] }
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
    preview,
  } = props;

  return [
    !commentDeleted ? renderTools(props) : null,
    !preview && commentReplying && !commentingDisabled ? renderCommentReply(props) : null,
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
    isSubredditModerator,
    reports,
  } = props;

  const className = cx('Comment__toolsContainer', 'clearfix', {
    'm-hidden': commentCollapsed,
  });

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
          isSticky={ comment.stickied }
          reports={ reports[comment.name] }
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
