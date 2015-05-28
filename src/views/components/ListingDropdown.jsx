import React from 'react';
import constants from '../../constants';

import { models } from 'snoode';

import SeashellsDropdown from '../components/SeashellsDropdown';
import UpvoteIcon from '../components/icons/UpvoteIcon';
import DownvoteIcon from '../components/icons/DownvoteIcon';
import CommentIcon from '../components/icons/CommentIcon';
import MobileButton from '../components/MobileButton';
import SnooIcon from '../components/icons/SnooIcon';
import InfoIcon from '../components/icons/InfoIcon';
import FlagIcon from '../components/icons/FlagIcon';
import TextIcon from '../components/icons/TextIcon';

class ListingDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    var likes = props.listing.likes;

    if (likes === false) {
      this.state.localScore = -1;
    } else if (likes === true) {
      this.state.localScore = 1;
    } else {
      this.state.localScore = 0;
    }

    this._onVote = this._onVote.bind(this);
    this._onUpvoteClick = this._onUpvoteClick.bind(this);
    this._onDownvoteClick = this._onDownvoteClick.bind(this);

    this._onReportClick = this._onReportClick.bind(this);
    this._onReportSubmit = this._onReportSubmit.bind(this);
    this._onReport = this._onReport.bind(this);
    this._cancelBubble = this._cancelBubble.bind(this);
  }

  render() {
    var props = this.props;
    var listing = props.listing;

    if (this.state.localScore > 0) {
      var voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }

    var reportLink;
    var reportForm;

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
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='1'/>
            <MobileButton className={ `Dropdown-button ${voteClass || ''}` } type='submit' onClick={this._onUpvoteClick}>
              <UpvoteIcon altered={this.state.localScore > 0} random={ props.random }/>
              <span className='Dropdown-text'>Upvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='-1'/>
            <MobileButton className={ `Dropdown-button ${voteClass || ''}` } type='submit' onClick={this._onDownvoteClick}>
              <DownvoteIcon altered={this.state.localScore < 0} random={ props.random }/>
              <span className='Dropdown-text'>Downvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={listing.permalink}>
            <CommentIcon/>
            <span className='Dropdown-text'>View comments</span>
          </MobileButton>
        </li>
        { permalink }
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/r/' + props.subreddit }>
            <SnooIcon/>
            <span className='Dropdown-text'>More from r/{ props.subreddit }</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/u/' + listing.author }>
            <InfoIcon/>
            <span className='Dropdown-text'>About { listing.author }</span>
          </MobileButton>
        </li>
        { reportLink }
      </SeashellsDropdown>
    );
  }

  componentDidMount() {
    this.props.app.on(constants.VOTE+':'+this.props.listing.id, this._onVote);
  }

  componentWillUnmount() {
    this.props.app.off(constants.VOTE+':'+this.props.listing.id, this._onVote);
  }

  _onUpvoteClick(evt) {
    evt.preventDefault();
    this.props.app.emit(constants.VOTE+':'+this.props.listing.id, 1);
  }

  _onDownvoteClick(evt) {
    evt.preventDefault();
    this.props.app.emit(constants.VOTE+':'+this.props.listing.id, -1);
  }

  _onVote(dir) {
    var localScore = Math.min(1, Math.max(-1, dir - this.state.localScore));
    this.setState({localScore: localScore});
  }

  _onReportClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      reportFormOpen: true,
    });
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
