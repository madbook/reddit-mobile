import React from 'react';

import DropdownContent from '../dropdown/DropdownContent';
import DropdownRow from '../dropdown/DropdownRow';
import DropdownReportRow from '../dropdown/DropdownReportRow';
import DropdownDeleteRow from '../dropdown/DropdownDeleteRow';

const T = React.PropTypes;

export default class CommentDropdownContent extends React.Component {
  static propTypes = {
    username: T.string.isRequired,
    userOwned: T.bool,
    saved: T.bool,
    permalinkUrl: T.string,
    userLoggedIn: T.bool,
    onEditClicked: T.func.isRequired,
    onDeleteClicked: T.func.isRequired,
    onGoldClicked: T.func.isRequired,
    onShareClicked: T.func.isRequired,
    onSaveClicked: T.func.isRequired,
    onProfileClicked: T.func.isRequired,
    onReportClicked: T.func.isRequired,
  };

  static defaultProps = {
    userOwned: false,
    saved: false,
    userLoggedIn: false,
    permalinkUrl: '',
  };

  render() {
    const { userOwned, userLoggedIn } = this.props;

    return (
      <DropdownContent>
        { userOwned ? this.renderEdit() : null }
        { userOwned ? this.renderDelete() : null }
        { !userOwned && false /* disabled for now */ ? this.renderGold() : null }
        { this.renderShare() }
        { userLoggedIn ? this.renderSave() : null }
        { this.renderProfile() }
        { userLoggedIn && !userOwned ? this.renderReport() : null }
      </DropdownContent>
    );
  }

  renderEdit() {
    return (
      <DropdownRow onClick={ this.props.onEditClicked }>
        <div className='DropdownRow__icon icon-post'/>
        <div className='DropdownRow__text'>Edit Comment</div>
      </DropdownRow>
    );
  }

  renderDelete() {
    return (
      <DropdownDeleteRow
        onDeleteClicked={ this.props.onDeleteClicked }
        thingName='Comment'
      />
    );
  }

  renderGold() {
    return (
      <DropdownRow onClick={ this.props.onGoldClicked }>
        <div className='DropdownRow__icon icon-gold-circled'/>
        <div className='DropdownRow__text'>Give Gold</div>
      </DropdownRow>
    );
  }

  renderShare() {
    return (
      <DropdownRow
        onClick={ this.props.onShareClicked }
        href={ this.props.permalinkUrl }
      >
        <div className='DropdownRow__icon icon-link'/>
        <div className='DropdownRow__text' >
          Permalink
        </div>
      </DropdownRow>
    );
  }

  renderSave() {
    const { saved } = this.props;

    let iconCls = 'DropdownRow__icon icon-save';
    if (saved) { iconCls += ' live'; }

    return (
      <DropdownRow onClick={ this.props.onSaveClicked }>
        <div className={ iconCls }/>
        <div className='DropdownRow__text'>{ saved ? 'Saved' : 'Save' }</div>
      </DropdownRow>
    );
  }

  renderProfile() {
    return (
      <DropdownRow
        onClick={ this.props.onProfileClicked }
        href={ `/u/${this.props.username}` }
      >
        <div className='DropdownRow__icon icon-user-account'/>
        <div className='DropdownRow__text' >
          { `${this.props.username}'s profile` }
        </div>
      </DropdownRow>
    );
  }

  renderReport() {
    return (
      <DropdownReportRow onReportClicked={ this.props.onReportClicked } />
    );
  }
}
