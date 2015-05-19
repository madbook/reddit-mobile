import React from 'react';
import constants from '../../constants';

import { models } from 'snoode';

import SeashellsDropdown from '../components/SeashellsDropdown';
import CommentIcon from '../components/icons/CommentIcon';
import MobileButton from '../components/MobileButton';
import SnooIcon from '../components/icons/SnooIcon';
import InfoIcon from '../components/icons/InfoIcon';
import FlagIcon from '../components/icons/FlagIcon';
import TextIcon from '../components/icons/TextIcon';
import SaveIcon from '../components/icons/SaveIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import CheckmarkIcon from '../components/icons/CheckmarkIcon';

class ListingDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      saved: props.listing.saved,
      hidden: props.listing.hidden,
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
            <FlagIcon random={ props.random }/>
            <span className='Dropdown-text'>Report this</span>
          </MobileButton>
          { reportForm }
        </li>
      );

      var saveIcon;
      var saveText = 'Save';

      var hideIcon;
      var hideText = 'Hide';


      if (this.state.saved) {
        saveIcon = (<span className='text-success'><SaveIcon /></span>);
        saveText = 'Saved';
      } else {
        saveIcon = (<SaveIcon />);
      }

      if (this.state.hidden) {
        hideIcon = (<span className='text-danger'><SettingsIcon /></span>);
        hideText = 'Hidden';
      } else {
        hideIcon = (<SettingsIcon />);
      }

      saveLink = (
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={ this._onSaveClick }>
            {saveIcon}
            <span className='Dropdown-text'>{saveText}</span>
          </MobileButton>
        </li>
      );

      if (this.props.showHide) {
        hideLink = (
          <li className='Dropdown-li'>
            <MobileButton className='Dropdown-button' onClick={ this._onHideClick }>
              {hideIcon}
              <span className='Dropdown-text'>{hideText}</span>
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
            <TextIcon />
            <span className='Dropdown-text'>Permalink</span>
          </MobileButton>
        </li>
      );
    }

    return (
      <SeashellsDropdown app={ props.app } random={ props.random } right={ true }>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={listing.permalink}>
            <CommentIcon/>
            <span className='Dropdown-text'>View comments</span>
          </MobileButton>
        </li>
        { permalink }
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/r/' + listing.subreddit }>
            <SnooIcon/>
            <span className='Dropdown-text'>More from r/{ listing.subreddit }</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/u/' + listing.author }>
            <InfoIcon/>
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

    var options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      id: this.props.listing.name,
    });

    if (this.state.saved) {
      this.props.app.api.saved.delete(options).done(() => { });
      this.setState({ saved: false });
    } else {
      this.props.app.api.saved.post(options).done(() => { });
      this.setState({ saved: true });
    }

    if (this.props.onSave) {
      this.props.onSave();
    }
  }

  _onHideClick(e) {
    e.preventDefault();
    // api call
    this.props.app.emit('hide', this.props.listing.id);
    var options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      id: this.props.listing.name,
    });

    if (this.state.hidden) {
      this.props.app.api.hidden.delete(options).done(() => { });
      this.setState({ hidden: false });
    } else {
      this.props.app.api.hidden.post(options).done(() => { });
      this.setState({ hidden: true });
    }

    if (this.props.onHide) {
      this.props.onHide();
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

    var options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: report,
    });

    this.props.app.api.reports.post(options).done((comment) => {
      this._onReport();
    });

    this.props.app.emit('report', this.props.listing.id);
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
}

export default ListingDropdown;
