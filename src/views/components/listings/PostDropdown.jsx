import React from 'react';

import propTypes from '../../../propTypes';
import BaseComponent from '../BaseComponent';
import DropdownController from '../dropdown/DropdownController';
import DropdownContent from '../dropdown/DropdownContent';
import DropdownRow from '../dropdown/DropdownRow';
import DropdownReportRow from '../dropdown/DropdownReportRow';
import DropdownDeleteRow from '../dropdown/DropdownDeleteRow';

const T = React.PropTypes;

export default class PostDropdown extends BaseComponent {
  static propTypes = {
    dropdownTarget: T.object.isRequired, // Dom Node
    post: propTypes.listing.isRequired,
    saved: T.bool.isRequired,
    userLoggedIn: T.bool.isRequired,
    userOwned: T.bool.isRequired,
    showingEditAndDel: T.bool.isRequired,
    onCloseDropdown: T.func.isRequired,
    app: T.object.isRequired,
    viewComments: T.bool.isRequired,
    handleReportPost: T.func.isRequired,
    handleHidePost: T.func.isRequired,
    handleSavePost: T.func.isRequired,
    handleDeletePost: T.func.isRequired,
    handleEditPost: T.func.isRequired,
  };

  render() {
    const {
      dropdownTarget,
      post,
      saved,
      viewComments,
      onCloseDropdown,
      app,
      userLoggedIn,
      userOwned,
      showingEditAndDel,
    } = this.props;

    const {
      author,
      subreddit,
      cleanPermalink,
    } = post;

    return (
      <DropdownController
        target={ dropdownTarget }
        onClose={ onCloseDropdown }
        app={ app }
        offset={ 8 }
      >
        <DropdownContent>
          { userOwned && showingEditAndDel ? this.renderEditRow() : null }
          { userOwned && showingEditAndDel ? this.renderDeleteRow() : null }
          { viewComments ? this.renderCommentsLinkRow(cleanPermalink) : null }
          { this.renderSubredditLink(subreddit) }
          { !userOwned && this.renderUserProfile(author) }
          { this.renderSaveRow(saved) }
          { this.renderHideRow() }
          { userLoggedIn && !userOwned ? this.renderReportRow() : null }
        </DropdownContent>
      </DropdownController>
    );
  }

  renderEditRow() {
    return (
      <DropdownRow onClick={ this.props.handleEditPost }>
        <div className='DropdownRow__icon icon-post' />
        <div className='DropdownRow__text'>Edit Post</div>
      </DropdownRow>
    );
  }

  renderDeleteRow() {
    return (
      <DropdownDeleteRow
        thingName='Post'
        onDeleteClicked={ this.props.handleDeletePost }
      />
    );
  }

  renderCommentsLinkRow(permaLink) {
    return (
      <DropdownRow href={ permaLink }>
        <div className='DropdownRow__icon icon-link' />
        <div className='DropdownRow__text'>Permalink</div>
      </DropdownRow>
    );
  }

  renderSubredditLink(subreddit) {
    const rSubreddit = `r/${subreddit}`;

    return (
      <DropdownRow href={ `/${rSubreddit}` }>
        <div className='DropdownRow__icon icon-snoosilhouette' />
        <div className='DropdownRow__text'>
          { `More from ${rSubreddit}` }
        </div>
      </DropdownRow>
    );
  }

  renderUserProfile(userName) {
    return (
      <DropdownRow href={ `/u/${userName}` }>
        <div className='DropdownRow__icon icon-user-account' />
        <div className='DropdownRow__text'>
          { `${userName}'s profile` }
        </div>
      </DropdownRow>
    );
  }

  renderSaveRow(saved) {
    const iconCls = `DropdownRow__icon icon-save ${saved ? 'lime' : ''}`;

    return (
      <DropdownRow onClick={ this.props.handleSavePost }>
        <div className={ iconCls } />
        <div className='DropdownRow__text'>
          { saved ? 'Saved' : 'Save' }
        </div>
      </DropdownRow>
    );
  }

  renderHideRow() {
    return (
      <DropdownRow onClick={ this.props.handleHidePost }>
        <div className='DropdownRow__icon icon-settings' />
        <div className='DropdownRow__text'>
          { 'Hide' }
        </div>
      </DropdownRow>
    );
  }

  renderReportRow() {
    return (
      <DropdownReportRow onReportClicked={ this.props.handleReportPost } />
    );
  }
}
