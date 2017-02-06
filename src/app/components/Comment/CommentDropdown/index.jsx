import React from 'react';

import { DropdownModal, DropdownRow, DropdownLinkRow } from 'app/components/Dropdown';
import ModeratorModal from 'app/components/ModeratorModal';
import { ReportsModal } from 'app/components/ReportsModal';

import { COMMENT } from 'apiClient/models/thingTypes';

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
    isSticky,
    approvedBy,
    removedBy,
    showModModal,
    modModalId,
    isMine,
    distinguishType,
    reportModalId,
    reports,
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
      <div>
        <ModeratorModal
          id={ id }
          modModalId={ modModalId }
          onClick={ onToggleModal }
          isRemoved={ isRemoved }
          isApproved={ isApproved }
          isSpam={ isSpam }
          approvedBy={ approvedBy }
          removedBy={ removedBy }
          distinguishType={ distinguishType }
          isMine={ isMine }
          isSticky={ isSticky }
          targetType={ COMMENT }
          reports={ reports }
          reportModalId={ reportModalId }
        />
        <ReportsModal
          reportModalId={ reportModalId }
          isRemoved={ isRemoved }
          isApproved={ isApproved }
          isSpam={ isSpam }
          approvedBy={ approvedBy }
          removedBy={ removedBy }
          reports={ reports }
          onClick={ onToggleModal }
        />
      </div>
    );
  } else {
    modal = (
      <DropdownModal id={ id } onClick={ onToggleModal } showX={ true }>
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
  distinguishType: T.string,
  isMine: T.bool,
  reportModalId: T.string,
  reports: T.object,
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
  modModalId: '',
  isDistinguished: '',
  isMine: false,
  reports: {},
  reportModalId: '',
};
