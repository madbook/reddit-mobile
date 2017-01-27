import React from 'react';

import { models } from '@r/api-client';

import { DropdownModal, DropdownRow, DropdownLinkRow } from 'app/components/Dropdown';
import ModeratorModal from 'app/components/ModeratorModal';

const { ModelTypes } = models;
const T = React.PropTypes;

export default function CommentDropdown(props) {
  const {
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
    isRemoved,
    isSpam,
    isApproved,
    approvedBy,
    removedBy,
    showModModal,
    modModalId,
  } = props;

  const userIsAuthor = commentAuthor === username;

  const modalContent = [
    userIsAuthor 
    ? <DropdownRow icon='post_edit' text='Edit Comment' onClick={ onEdit }/>
    : null,
    userIsAuthor
    ? <DropdownRow icon='delete_remove' text='Delete Comment' onClick={ onDelete }/>
    : null,
    <DropdownLinkRow href={ permalink } icon='link' text='Permalink'/>,
    username
    ? <DropdownRow icon='save' text={ isSaved ? 'Saved' : 'Save' } isSelected={ isSaved } onClick={ onToggleSave }/>
    : null,
    !userIsAuthor
    ? <DropdownLinkRow href={ `/user/${commentAuthor}` } icon='user-account' text={ `${commentAuthor}'s profile` }/>
    : null,
    username
    ? <DropdownRow onClick={ onReportComment } icon='flag' text='Report'/>
    : null,
  ];

  let modal;

  if (showModModal && isSubredditModerator) {
    modal = (
      <ModeratorModal
        id={ id }
        modModalId={ modModalId }
        onClick={ onToggleModal }
        isRemoved={ isRemoved }
        isApproved={ isApproved }
        isSpam={ isSpam }
        approvedBy={ approvedBy }
        removedBy={ removedBy }
        targetType={ ModelTypes.COMMENT }
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

CommentDropdown.propTypes = {
  id: T.string.isRequired,
  permalink: T.string.isRequired,
  commentAuthor: T.string.isRequired,
  username: T.string,
  isSaved: T.bool,
  onEdit: T.func,
  onDelete: T.func,
  onToggleSave: T.func,
  onReportComment: T.func.isRequired,
  isSubredditModerator: T.bool.isRequired,
  isRemoved: T.bool,
  isSpam: T.bool,
  isApproved: T.bool,
  approvedBy: T.string,
  removedBy: T.string,
  showModModal: T.bool,
  modModalId: T.string,
};

CommentDropdown.defaultProps = {
  username: '',
  isSaved: false,
  onEdit: () => {},
  onDelete: () => {},
  onToggleSave: () => {},
  onToggleModal: () => {},
  isRemoved: false,
  isSpam: false,
  isApproved: false,
  approvedBy: null,
  removedBy: null,
  showModModal: false,
  modModalId: null,
};
