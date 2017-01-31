import React from 'react';

import { models } from '@r/api-client';

import { DropdownModal, DropdownRow, DropdownLinkRow } from 'app/components/Dropdown';
import ModeratorModal from 'app/components/ModeratorModal';

const { ModelTypes } = models;
const T = React.PropTypes;

const renderSubredditDropdownLinkRow = subreddit => (
  <DropdownLinkRow
    href={ `/r/${subreddit}` }
    icon='snoosilhouette'
    text={ `More from r/${subreddit}` }
  />
);

export default function PostDropdown(props) {
  const {
    id,
    canModify,
    permalink,
    subreddit,
    author,
    isLoggedIn,
    isSaved,
    onToggleEdit,
    onToggleHide,
    onReportPost,
    onToggleSave,
    onToggleModal,
    isSticky,
    isSubredditModerator,
    isRemoved,
    isApproved,
    isSpam,
    isNSFW,
    isSpoiler,
    approvedBy,
    removedBy,
    showModModal,
    modModalId,
    distinguishType,
    isMine,
  } = props;

  const modalContent = [
    canModify && <DropdownRow icon='post_edit' text='Edit Post' onClick={ onToggleEdit } />,
    <DropdownLinkRow href={ permalink } icon='link' text='Permalink'/>,
    subreddit && renderSubredditDropdownLinkRow(subreddit),
    <DropdownLinkRow href={ `/user/${author}` } icon='user-account' text={ `${author}'s profile` }/>,
    isLoggedIn ? <DropdownRow icon='save' text={ isSaved ? 'Saved' : 'Save' } onClick={ onToggleSave } isSelected={ isSaved }/> : null,
    isLoggedIn ? <DropdownRow icon='hide' text='Hide' onClick={ onToggleHide }/> : null,
    isLoggedIn ? <DropdownRow onClick={ onReportPost } icon='flag' text='Report'/> : null,
  ];

  let modal;

  if (showModModal && isSubredditModerator) {
    modal = (
      <ModeratorModal
        id={ id }
        modModalId={ modModalId }
        onClick={ onToggleModal }
        isSticky={ isSticky }
        isRemoved={ isRemoved }
        isApproved={ isApproved }
        isSpam={ isSpam }
        isNSFW={ isNSFW }
        isSpoiler={ isSpoiler }
        approvedBy={ approvedBy }
        removedBy={ removedBy }
        isMine={ isMine }
        distinguishType={ distinguishType }
        targetType={ ModelTypes.POST }
      >
      </ModeratorModal>
    );
  } else {
    modal = (
      <DropdownModal id={ id } onClick={ onToggleModal }>
        { modalContent }
      </DropdownModal>
    );
  }

  return modal;
}

PostDropdown.propTypes = {
  id: T.string.isRequired,
  canModify: T.bool, // can edit / can delete
  permalink: T.string.isRequired,
  author: T.string.isRequired,
  isSticky: T.bool,
  isSaved: T.bool,
  isLoggedIn: T.bool,
  subreddit: T.string,
  onToggleSave: T.func,
  onToggleHide: T.func,
  onReportPost: T.func.isRequired,
  onToggleEdit: T.func,
  onToggleModal: T.func,
  isRemoved: T.bool,
  isApproved: T.bool,
  isNSFW: T.bool,
  isSpam: T.bool,
  isSpoiler: T.bool,
  approvedBy: T.string,
  removedBy: T.string,
  modModalId: T.string,
  showModModal: T.bool,
};

PostDropdown.defaultProps = {
  canModify: false,
  isSticky: false,
  isSaved: false,
  isLoggedIn: false,
  onToggleSave: () => {},
  onToggleHide: () => {},
  onToggleEdit: () => {},
  onToggleModal: () => {},
  modModalId: null,
  showModModal: false,
};
