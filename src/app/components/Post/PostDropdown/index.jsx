import React from 'react';

import { POST } from 'apiClient/models/thingTypes';

import ModeratorModal from 'app/components/ModeratorModal';
import {
  DropdownModal,
  DropdownRow,
  DropdownLinkRow,
} from 'app/components/Dropdown';

import { ReportsModal } from 'app/components/ReportsModal';

const T = React.PropTypes;

export default function PostDropdown(props) {
  const {
    id,
    canModify,
    permalink,
    subreddit,
    author,
    isLoggedIn,
    onToggleEdit,
    onToggleModal,
    isSticky,
    isSubredditModerator,
    isRemoved,
    isApproved,
    isSpam,
    isLocked,
    isNSFW,
    isSpoiler,
    approvedBy,
    removedBy,
    showModModal,
    modModalId,
    distinguishType,
    isMine,
    reports,
    reportModalId,
  } = props;

  if (showModModal && isSubredditModerator) {
    return (
      <div>
        <ModeratorModal
          id={ id }
          modModalId={ modModalId }
          onClick={ onToggleModal }
          isSticky={ isSticky }
          isRemoved={ isRemoved }
          isApproved={ isApproved }
          isSpam={ isSpam }
          isLocked={ isLocked }
          isNSFW={ isNSFW }
          isSpoiler={ isSpoiler }
          approvedBy={ approvedBy }
          removedBy={ removedBy }
          isMine={ isMine }
          distinguishType={ distinguishType }
          targetType={ POST }
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
  }

  return (
    <DropdownModal id={ id } onClick={ onToggleModal } showX={ true }>
      { canModify ?
        <DropdownRow
          icon='post_edit'
          text='Edit Post'
          onClick={ onToggleEdit }
        /> : null }
      <DropdownLinkRow
        href={ permalink }
        icon='link'
        text='Permalink'
      />
      { subreddit ? renderSubredditRow(subreddit) : null }
      <DropdownLinkRow
        href={ `/user/${author}` }
        icon='user-account'
        text={ `${author}'s profile` }
      />
      { isLoggedIn ? renderLoggedInRows(props) : null }
    </DropdownModal>
  );
}

function renderLoggedInRows(props) {
  const { isSaved, isHidden, onToggleSave,
          onToggleHide, onReportPost } = props;
  return [
    <DropdownRow
      icon='save'
      text={ isSaved ? 'Saved' : 'Save' }
      onClick={ onToggleSave }
      isSelected={ isSaved }
    />,
    <DropdownRow
      icon='hide'
      text={ isHidden ? 'Unhide': 'Hide' }
      onClick={ onToggleHide }
    />,
    <DropdownRow
      onClick={ onReportPost }
      icon='flag'
      text='Report'
    />,
  ];
}

function renderSubredditRow(subreddit) {
  return (
    <DropdownLinkRow
      href={ `/r/${subreddit}` }
      icon='snoosilhouette'
      text={ `More from r/${subreddit}` }
    />
  );
}

PostDropdown.propTypes = {
  id: T.string.isRequired,
  canModify: T.bool, // can edit / can delete
  permalink: T.string.isRequired,
  author: T.string.isRequired,
  isSticky: T.bool,
  isSaved: T.bool,
  isLoggedIn: T.bool,
  isHidden: T.bool,
  subreddit: T.string,
  onToggleSave: T.func,
  onToggleHide: T.func,
  onReportPost: T.func.isRequired,
  onToggleEdit: T.func,
  onToggleModal: T.func,
  isRemoved: T.bool,
  isApproved: T.bool,
  isLocked: T.bool,
  isNSFW: T.bool,
  isSpam: T.bool,
  isSpoiler: T.bool,
  approvedBy: T.string,
  removedBy: T.string,
  modModalId: T.string,
  showModModal: T.bool,
  reports: T.object,
};

PostDropdown.defaultProps = {
  canModify: false,
  isSticky: false,
  isSaved: false,
  isLoggedIn: false,
  isHidden: false,
  modModalId: '',
  onToggleSave: () => {},
  onToggleHide: () => {},
  onToggleEdit: () => {},
  onToggleModal: () => {},
  showModModal: false,
  reports: null,
};
