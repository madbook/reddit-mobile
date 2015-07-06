import React from 'react';
import constants from '../../constants';
import globals from '../../globals';

import { models } from 'snoode';

import BaseComponent from './BaseComponent';
import SeashellsDropdown from '../components/SeashellsDropdown';
import MobileButton from '../components/MobileButton';
import SaveIcon from '../components/icons/SaveIcon';
import FlagIcon from '../components/icons/FlagIcon';

class ListingDropdown extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      saved: props.listing.saved,
      hidden: props.listing.hidden,
      showDelPrompt: false,
    };

    var likes = props.listing.likes;

    if (likes === false) {
      this.state.localScore = -1;
    } else if (likes === true) {
      this.state.localScore = 1;
    } else {
      this.state.localScore = 0;
    }

    this._onReportClick = this._onReportClick.bind(this);
    this._onReportSubmit = this._onReportSubmit.bind(this);
    this._onReport = this._onReport.bind(this);
    this._cancelBubble = this._cancelBubble.bind(this);

    this._onHideClick = this._onHideClick.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onEditClick = this._onEditClick.bind(this);
    this._onDelToggle = this._onDelToggle.bind(this);
    this._onDelClick = this._onDelClick.bind(this);
  }

  render() {
    var props = this.props;
    var listing = props.listing;

    var reportLink;
    var reportForm;

    var hideLink;
    var saveLink;

    if (props.token) {
      if (this.state.reportFormOpen) {
        reportForm = (
          <form action={`/report/${ props.listing.name }`} method='POST' onSubmit={ this._onReportSubmit } onClick={ this._cancelBubble }>
            <div className='input-group'>
              <input type='text' className='form-control' placeholder='reason' ref='otherReason' />
              <span className='input-group-btn'>
                <button className='btn btn-default' type='submit'>
                  <span className='glyphicon glyphicon-chevron-right'></span>
                </button>
              </span>
            </div>
          </form>
        );
      }

      reportLink = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={ this._onReportClick }>
            <FlagIcon/>
            <span className='Dropdown-text'>Report this</span>
          </MobileButton>
          { reportForm }
        </li>
      );

      var saved = this.state.saved;
      var hidden = this.state.hidden;

      saveLink = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={ this._onSaveClick }>
            <SaveIcon altered={ saved }/>
            <span className='Dropdown-text'>{ saved ? 'Saved' : 'Save' }</span>
          </MobileButton>
        </li>
      );

      if (this.props.showHide) {
        hideLink = (
          <li className='Dropdown-li'>
            <MobileButton className='Dropdown-button' onClick={ this._onHideClick }>
              <span className='icon-settings-circled'>{' '}</span>
              <span className='Dropdown-text'>{ hidden ? 'Hidden' : 'Hide' }</span>
            </MobileButton>
          </li>
        );
      }
    }

    var permalink;

    if (props.permalink) {
      permalink = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ props.permalink }>
            <span className='icon-link-circled' />
            <span className='Dropdown-text'>Permalink</span>
          </MobileButton>
        </li>
      );
    }

    var editLink;

    if (props.showEdit) {
      editLink = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={ this._onEditClick }>
            <span className='icon-post' />
            <span className='Dropdown-text'>Edit Post</span>
          </MobileButton>
        </li>
      );
    }

    var delLink;

    if (props.showDel) {
      var confirmClass = 'hidden';
      var toggleDelBtn = (
        <MobileButton className='Dropdown-button' onClick={ this._onDelToggle }>
          <span className='icon-x' />
          <span className='Dropdown-text'>Delete Post</span>
        </MobileButton>
      );
      if (this.state.showDelPrompt) {
        confirmClass = '';
        toggleDelBtn = null;
      }


      delLink = (
        <li className='Dropdown-li'>
          { toggleDelBtn }
          <div className={ confirmClass }>
            <p className='Dropdown-menu-text'>Are you sure?</p>
            <div className='btn-group btn-group-justified'>
              <div className='btn-group'>
                <button type='button' className='btn btn-primary' onClick={ this._onDelClick }>yes</button>
              </div>
              <div className='btn-group'>
                <button type='button' className='btn btn-primary' onClick={ this._onDelToggle }>no</button>
              </div>
            </div>
          </div>
        </li>
      );
    }

    var viewComments;
    if (props.viewComments && props.listing._type === "Link") {
      viewComments = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={listing.permalink}>
            <span className='icon-comments-circled'/>
            <span className='Dropdown-text'>View comments</span>
          </MobileButton>
        </li>
      );
    }

    return (
      <SeashellsDropdown right={ true }>
        { editLink }
        { delLink }
        { viewComments }
        { permalink }
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/r/' + listing.subreddit }>
            <span className='icon-snoo-circled' />
            <span className='Dropdown-text'>More from r/{ listing.subreddit }</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/u/' + listing.author }>
            <span className='icon-info-circled' />
            <span className='Dropdown-text'>About { listing.author }</span>
          </MobileButton>
        </li>
        { saveLink }
        { hideLink }
        { reportLink }
      </SeashellsDropdown>
    );
  }

  _onReportClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      reportFormOpen: true,
    });
  }

  _onSaveClick(e) {
    e.preventDefault();

    var options = globals().app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      id: this.props.listing.name,
    });

    if (this.state.saved) {
      globals().app.api.saved.delete(options).done(() => { });
      this.setState({ saved: false });
    } else {
      globals().app.api.saved.post(options).done(() => { });
      this.setState({ saved: true });
    }

    if (this.props.onSave) {
      this.props.onSave();
    }
  }

  _onHideClick(e) {
    e.preventDefault();
    // api call
    globals().app.emit('hide', this.props.listing.id);
    var options = globals().app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      id: this.props.listing.name,
    });

    if (this.state.hidden) {
      globals().app.api.hidden.delete(options).done(() => { });
      this.setState({ hidden: false });
    } else {
      globals().app.api.hidden.post(options).done(() => { });
      this.setState({ hidden: true });
    }

    if (this.props.onHide) {
      this.props.onHide();
    }
  }

  _onEditClick(e) {
    e.preventDefault();

    if (this.props.onEdit) {
      this.props.onEdit();
    }
  }

  _onReportSubmit(e) {
    e.preventDefault();

    var id = this.props.listing.name;
    var textEl = this.refs.otherReason.getDOMNode();

    var report = new models.Report({
      thing_id: id,
      reason: 'other',
      other_reason: textEl.value.trim(),
    });

    var options = globals().app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: report,
    });

    globals().app.api.reports.post(options).done((comment) => {
      this._onReport();
    });

    globals().app.emit('report', this.props.listing.id);
  }

  _onReport() {
    this.setState({
      reported: true,
    });

    if (this.props.onReport) {
      this.props.onReport();
    }
  }

  _cancelBubble(e) {
    e.stopPropagation();
  }

  _onDelToggle(e) {
    e.stopPropagation();
    this.setState({
      showDelPrompt: !this.state.showDelPrompt,
    });
  }

  _onDelClick (){
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
}

export default ListingDropdown;
