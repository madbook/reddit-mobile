import React from 'react';
import constants from '../../constants';

import SeashellsDropdown from '../components/SeashellsDropdown';
import UpvoteIcon from '../components/icons/UpvoteIcon';
import DownvoteIcon from '../components/icons/DownvoteIcon';
import CommentIcon from '../components/icons/CommentIcon';
import MobileButton from '../components/MobileButton';
import SnooIcon from '../components/icons/SnooIcon';
import InfoIcon from '../components/icons/InfoIcon';

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
  }

  render() {
    if (this.state.localScore > 0) {
      var voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }
    var listing = this.props.listing;
    return (
      <SeashellsDropdown app={ this.props.app } random={ this.props.random } right={ true }>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='1'/>
            <MobileButton className={ `Dropdown-button ${voteClass || ''}` } type='submit' onClick={this._onUpvoteClick}>
              <UpvoteIcon altered={this.state.localScore > 0} random={ this.props.random }/>
              <span className='Dropdown-text'>Upvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='-1'/>
            <MobileButton className={ `Dropdown-button ${voteClass || ''}` } type='submit' onClick={this._onDownvoteClick}>
              <DownvoteIcon altered={this.state.localScore < 0} random={ this.props.random }/>
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

export default ListingDropdown;
