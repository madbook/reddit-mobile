import React from 'react';
import constants from '../../constants';

import SeashellIconFactory from '../components/icons/SeashellIcon';
var SeashellIcon;

import UpvoteIconFactory from '../components/icons/UpvoteIcon';
var UpvoteIcon;

import DownvoteIconFactory from '../components/icons/DownvoteIcon';
var DownvoteIcon;

import GoldIconFactory from '../components/icons/GoldIcon';
var GoldIcon;

import CommentIconFactory from '../components/icons/CommentIcon';
var CommentIcon;

import SaveIconFactory from '../components/icons/SaveIcon';
var SaveIcon;

import FlagIconFactory from '../components/icons/FlagIcon';
var FlagIcon;

import ShareIconFactory from '../components/icons/ShareIcon';
var ShareIcon;

import VoteFactory from '../components/Vote';
var Vote;

import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

import SnooIconFactory from '../components/icons/SnooIcon';
var SnooIcon;

import InfoIconFactory from '../components/icons/InfoIcon';
var InfoIcon;

import DropdownFactory from '../components/Dropdown';
var Dropdown;

class ListingDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    var likes = props.listing.likes;

    if (likes === false) {
      this.state.localScore = -1;
    } else if (likes === true) {
      this.state.localScore = 1;
    } else {
      this.state.localScore = 0;
    }

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
    this._onVote = this._onVote.bind(this);
  }

  render() {
    if (this.state.localScore > 0) {
      var voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }
    var opened = this.state.opened;
    var listing = this.props.listing;
    var button = <button><SeashellIcon played={opened} /></button>;
    return (
      <Dropdown app={ this.props.app } right={ true } button={ button } id={ this._id }>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='1'/>
            <MobileButton className={'Dropdown-button' + voteClass} type='submit' onClick={this._onClick.bind(this, 'upvote')}>
              <UpvoteIcon altered={this.state.localScore > 0}/>
              <span className='Dropdown-text'>Upvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='-1'/>
            <MobileButton className={'Dropdown-button' + voteClass} type='submit' onClick={this._onClick.bind(this, 'downvote')}>
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
      </Dropdown>
    );
  }

  componentDidMount() {
    this.props.app.on(constants.VOTE+':'+this.props.listing.id, this._onVote);
    this.props.app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    this.props.app.off(constants.VOTE+':'+this.props.listing.id, this._onVote);
    this.props.app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  _onClick(str, evt) {
    switch (str) {
      case 'upvote':
        evt.preventDefault();
        this.props.app.emit(constants.VOTE+':'+this.props.listing.id, 1);
        break;
      case 'downvote':
        evt.preventDefault();
        this.props.app.emit(constants.VOTE+':'+this.props.listing.id, -1);
        break;
      case 'gold':
        // TODO: give gold
        break;
      case 'save':
        // TODO: save
        break;
      case 'report':
        // TODO: report
        break;
      case 'share':
        // TODO: share
        break;
    }
  }

  _onVote(dir) {
    var localScore = Math.min(1, Math.max(-1, dir - this.state.localScore));
    this.setState({localScore: localScore});
  }

  _onOpen(bool) {
    this.setState({opened: bool});
  }
}

function ListingDropdownFactory(app) {
  SeashellIcon = SeashellIconFactory(app);
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  GoldIcon = GoldIconFactory(app);
  InfoIcon = InfoIconFactory(app);
  ShareIcon = ShareIconFactory(app);
  SaveIcon = SaveIconFactory(app);
  FlagIcon = FlagIconFactory(app);
  CommentIcon = CommentIconFactory(app);
  SnooIcon = SnooIconFactory(app);
  Vote = VoteFactory(app);
  MobileButton = MobileButtonFactory(app);
  Dropdown = DropdownFactory(app);
  return app.mutate('core/components/ListingDropdown', ListingDropdown);
}

export default ListingDropdownFactory;
