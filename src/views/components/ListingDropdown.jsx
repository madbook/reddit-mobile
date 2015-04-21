import React from 'react';
import constants from '../../constants';

import SeashellsDropdownFactory from '../components/SeashellsDropdown';
var SeashellsDropdown;

import UpvoteIconFactory from '../components/icons/UpvoteIcon';
var UpvoteIcon;

import DownvoteIconFactory from '../components/icons/DownvoteIcon';
var DownvoteIcon;

import CommentIconFactory from '../components/icons/CommentIcon';
var CommentIcon;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

import SnooIconFactory from '../components/icons/SnooIcon';
var SnooIcon;

import InfoIconFactory from '../components/icons/InfoIcon';
var InfoIcon;

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
  }

  render() {
    if (this.state.localScore > 0) {
      var voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }
    var listing = this.props.listing;
    return (
      <SeashellsDropdown app={ this.props.app } right={ true }>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='1'/>
            <MobileButton className={'Dropdown-button' + voteClass} type='submit' onClick={this._onUpvoteClick}>
              <UpvoteIcon altered={this.state.localScore > 0}/>
              <span className='Dropdown-text'>Upvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='-1'/>
            <MobileButton className={'Dropdown-button' + voteClass} type='submit' onClick={this._onDownvoteClick}>
              <DownvoteIcon altered={this.state.localScore < 0}/>
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
}

function ListingDropdownFactory(app) {
  SeashellsDropdown = SeashellsDropdownFactory(app);
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  InfoIcon = InfoIconFactory(app);
  CommentIcon = CommentIconFactory(app);
  SnooIcon = SnooIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  return app.mutate('core/components/ListingDropdown', ListingDropdown);
}

export default ListingDropdownFactory;
