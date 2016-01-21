import React from 'react';

import SquareButton from '../formElements/SquareButton';

const T = React.PropTypes;

export default class CommentDropdownContent extends React.Component {
  static propTypes = {
    username: T.string.isRequired,
    userOwned: T.bool,
    saved: T.bool,
    permalinkUrl: T.string,
    userLoggedIn: T.bool,
    onEditClicked: T.func,
    onDeleteClicked: T.func,
    onGoldClicked: T.func,
    onShareClicked: T.func,
    onSaveClicked: T.func,
    onProfileClicked: T.func,
    onReportClicked: T.func,
  };
  
  static defaultProps = {
    userOwned: false,
    saved: false,
    userLoggedIn: false,
    permalinkUrl: '',
    onEditClicked: () => {},
    onDeleteClicked: () => {},
    onGoldClicked: () => {},
    onShareClicked: () => {},
    onSaveClicked: () => {},
    onProfileClicked: () => {},
    onReportClicked: () => {},
  };
  
  constructor(props) {
    super(props);
    
    this.state = {
      showReportForm: false,
      reportReason: '',
      reportEnabled: false,
    };
    
    this.toggleReportForm = this.toggleReportForm.bind(this);
    this.handleReportReason = this.handleReportReason.bind(this);
    this.handleReportSubmit = this.handleReportSubmit.bind(this);
    this.handleReportClicked = this.handleReportClicked.bind(this);
    this.handleInputDrawn = this.handleInputDrawn.bind(this);
  }
  
  toggleReportForm() {
    this.setState({
      showReportForm: !this.state.showReportForm,
    });
  }
  
  handleReportReason(e) {
    const value = e.target.value;
    
    this.setState({
      reportReason: value,
      reportEnabled: !!value,
    });
  }
  
  handleReportSubmit() {
    this.props.onReportClicked(this.state.reportReason.trim());
  }
  
  handleReportClicked(e) {
    e.stopPropagation();
  }
  
  handleInputDrawn(input) {
    if (input) {
      input.focus();
    }
  }
  
  render() {
    const { userOwned, userLoggedIn } = this.props;
    
    return (
      <div className='CommentDropdownContent'>
        { userOwned ? this.renderEdit() : null }
        { userOwned ? this.renderDelete() : null }
        { !userOwned && false /* disabled for now */ ? this.renderGold() : null }
        { this.renderShare() }
        { userLoggedIn ? this.renderSave() : null }
        { this.renderProfile() }
        { userLoggedIn && !userOwned ? this.renderReport() : null }
      </div>
    );
  }
  
  renderEdit() {
    return (
      <div className='CommentDropdownContent__edit' onClick={ this.props.onEditClicked }>
        <div className='CommentDropdownContent__icon icon-post'/>
        <div className='CommentDropdownContent__text'>Edit Comment</div>
      </div>
    );
  }
  
  renderDelete() {
    return (
      <div className='CommentDropdownContent__delete' onClick={ this.props.onDeleteClicked }>
        <div className='CommentDropdownContent__icon icon-x'/>
        <div className='CommentDropdownContent__text'>Delete Comment</div>
      </div>
    );
  }
  
  renderGold() {
    return (
      <div className='CommentDropdownContent__giveGold' onClick={ this.props.onGoldClicked }>
        <div className='CommentDropdownContent__icon icon-gold-circled'/>
        <div className='CommentDropdownContent__text'>Give Gold</div>
      </div>
    );
  }
  
  renderShare() {
    return (
      <a
        className='CommentDropdownContent__share'
        onClick={ this.props.onShareClicked }
        href={ this.props.permalinkUrl }
      >
        <div className='CommentDropdownContent__icon icon-link'/>
        <div className='CommentDropdownContent__text' >
          Permalink
        </div>
      </a>
    );
  }
  
  renderSave() {
    const { saved } = this.props;
    
    let iconCls = 'CommentDropdownContent__icon icon-save';
    if (saved) { iconCls += ' m-selected'; }
    
    return (
      <div className='CommentDropdownContent__save' onClick={ this.props.onSaveClicked }>
        <div className={ iconCls }/>
        <div className='CommentDropdownContent__text'>{ saved ? 'Saved' : 'Save' }</div>
      </div>
    );
  }
  
  renderProfile() {
    return (
      <a
        className='CommentDropdownContent__profile'
        onClick={ this.props.onProfileClicked }
        href={ `/u/${this.props.username}` }
      >
        <div className='CommentDropdownContent__icon icon-user-account'/>
        <div className='CommentDropdownContent__text' >
          { `${this.props.username}'s profile` }
        </div>
      </a>
    );
  }
  
  renderReport() {
    const { showReportForm } = this.state;
    const icon = showReportForm ? 'icon-x' : 'icon-flag';
    const iconCls = `CommentDropdownContent__icon ${icon}`;
    
    return (
      <div className='CommentDropdownContent__report' onClick={ this.toggleReportForm }>
        <div className={ iconCls }/>
        { showReportForm ? this.renderReportForm() : this.renderReportText() }
      </div>
    );
  }
  
  renderReportText() {
    return (
      <div className='CommentDropdownContent__text' >
        Report
      </div>
    );
  }
  
  renderReportForm() {
    const { reportReason, reportEnabled } = this.state;
    
    return (
      <div
        className='CommentDropdownContent__reportForm'
        onClick={ this.handleReportClicked }
      >
        <input
          className='CommentDropdownContent__reportInput'
          value={ reportReason }
          onChange={ this.handleReportReason }
          ref={ this.handleInputDrawn }
          placeholder='Reason for reporting'
        />
        <div className='CommentDropdownContent__reportButton'>
          <SquareButton
            text='Report'
            enabled={ reportEnabled }
            onClick={ this.handleReportSubmit }
          />
        </div>
      </div>
    );
  }
}
