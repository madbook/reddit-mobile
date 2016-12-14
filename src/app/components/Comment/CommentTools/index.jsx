import './styles.less';
import React from 'react';
import { ModalTarget } from '@r/widgets/modal';

import VotingBox from 'app/components/VotingBox';
import CommentDropdown from '../CommentDropdown';
import cx from 'lib/classNames';

const T = React.PropTypes;

export default function CommentTools(props) {
  const {
    id,
    score,
    scoreHidden,
    voteDirection,
    commentingDisabled,
    votingDisabled,
    commentAuthor,
    username,
    saved,
    permalinkUrl,
    onEdit,
    onDelete,
    onToggleSave,
    onReportComment,
    onToggleModal,
    isSubredditModerator,
    isApproved,
    isSpam,
    isRemoved,
    approvedBy,
    removedBy,
  } = props;

  const modModalId = `mod-${id}`;

  return (
    <div className='CommentTools'>
      { commentingDisabled ? null : renderReply(props) }
      { renderSeashells(id) }
      { isSubredditModerator ? renderModShield(modModalId) : null }
      { renderDivider(props) }
      { renderVote(id, score, scoreHidden, voteDirection, votingDisabled) }
      { renderDropdown(id, permalinkUrl, commentAuthor, username, saved,
                       onEdit, onDelete, onToggleSave, onReportComment, onToggleModal,
                       isSubredditModerator, isApproved, isSpam, isRemoved,
                       approvedBy, removedBy, false, null) }
      { isSubredditModerator ? renderDropdown(id, permalinkUrl, commentAuthor, username, saved,
                       onEdit, onDelete, onToggleSave, onReportComment, onToggleModal,
                       isSubredditModerator, isApproved, isSpam, isRemoved,
                       approvedBy, removedBy, true, modModalId) : null }
    </div>
  );
}

CommentTools.propTypes = {
  id: T.string.isRequired,
  score: T.number.isRequired,
  commentAuthor: T.string.isRequired,
  username: T.string, // The user's name
  scoreHidden: T.bool,
  voteDirection: T.number,
  votingDisabled: T.bool,
  saved: T.bool,
  permalinkUrl: T.string,
  onEdit: T.func,
  onDelete: T.func,
  onToggleSave: T.func,
  onReportComment: T.func.isRequired,
  onReplyOpen: T.func,
  onToggleModal: T.func.isRequired,
  isSpam: T.bool,
  isRemoved: T.bool,
  isApproved: T.bool,
  approvedBy: T.string,
  removedBy: T.string,
};

CommentTools.defaultProps = {
  voteDirection: 0,
  votingDisabled: false,
  scoreHidden: false,
  saved: false,
  permalinkUrl: '',
  onEdit: () => {},
  onDelete: () => {},
  onToggleSave: () => {},
  onToggleReply: () => {},
  onToggleModal: () => {},
};

const renderReply = ({ commentReplying, onToggleReply }) => {
  return (
    <span
      className={ cx('CommentTools__reply icon icon-reply2', {
        'CommentTools__reply__replying': commentReplying,
      }) }
      onClick={ onToggleReply }
    />
  );
};

const renderModShield = (modModalId) => (
  <ModalTarget
    id={ modModalId }
  >
    <div className='CommentTools__more icon icon-mod'/>
  </ModalTarget>
);

const renderSeashells = id => (
  <ModalTarget
    id={ id }
  >
    <div className='CommentTools__more icon icon-seashells'/>
  </ModalTarget>
);

const renderVote = (id, score, scoreHidden, voteDirection, votingDisabled) => (
  <VotingBox
    thingId={ id }
    score={ score }
    scoreHidden={ scoreHidden }
    voteDirection={ voteDirection }
    hideDownvote={ votingDisabled }
  />
);

const renderDivider = () => (
  <div className='CommentTools__divider' />
);

const renderDropdown = (
  id,
  permalink,
  commentAuthor,
  username,
  isSaved,
  onEdit,
  onDelete,
  onToggleSave,
  onReportComment,
  onToggleModal,
  isSubredditModerator,
  isApproved,
  isSpam,
  isRemoved,
  approvedBy,
  removedBy,
  showModModal,
  modModalId
) => (
  <CommentDropdown
    id={ id }
    permalink={ permalink }
    commentAuthor={ commentAuthor }
    username={ username }
    isSaved={ isSaved }
    onEdit={ onEdit }
    onDelete={ onDelete }
    onToggleSave={ onToggleSave }
    onReportComment={ onReportComment }
    onToggleModal={ onToggleModal }
    isSubredditModerator={ isSubredditModerator }
    isApproved={ isApproved }
    isSpam={ isSpam }
    isRemoved={ isRemoved }
    approvedBy={ approvedBy }
    removedBy={ removedBy }
    showModModal={ showModModal }
    modModalId={ modModalId }
  />
);
