import React from 'react';
import EllipsisIconFactory from '../components/EllipsisIcon';
var EllipsisIcon;
import UpvoteIconFactory from '../components/UpvoteIcon';
var UpvoteIcon;
import DownvoteIconFactory from '../components/DownvoteIcon';
var DownvoteIcon;
import GoldIconFactory from '../components/GoldIcon';
var GoldIcon;
import VoteFactory from '../components/Vote';
var Vote;
import MobileButtonFactory from '../components/MobileButton';
var MobileButton;
import DropdownFactory from '../components/Dropdown';
var Dropdown;

class ListingDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rollover:'',
      direction:0,
      opened:false,
    };
    var likes = this.props.listing.likes === true
    if (likes === true) {
      this.state.direction=1;
    } else if (likes === false) {
      this.state.direction=-1;
    } else {
      this.state.direction=0;
    }
    this._onOpen=this._onOpen.bind(this);
    this._id = Math.random();
    this._onRemoteVote = this._onRemoteVote.bind(this);
  }

  componentDidMount () {
    this.props.app.on(Vote.REMOTE_VOTE+':'+this.props.listing.id, this._onRemoteVote);
    this.props.app.on(Dropdown.OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    this.props.app.off(Vote.REMOTE_VOTE+':'+this.props.listing.id, this._onRemoteVote);
    this.props.app.off(Dropdown.OPEN + ':' + this._id, this._onOpen);
  }

  _onRemoteVote(direction) {
    this.setState({direction:direction});
  }

  render() {
    var opened = this.state.opened;
    var listing = this.props.listing;
    var button = <button><EllipsisIcon opened={opened}/></button>;
    return (
      <Dropdown app={ this.props.app } right={ true } button={ button } id={ this._id }>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='1'/>
            <MobileButton className='Dropdown-button' type='submit' onClick={this._onClick.bind(this, 'upvote')} over={this._onMouseEnter.bind(this, 'upvote')} out={this._onMouseLeave.bind(this, 'upvote')}>
              <UpvoteIcon hovered={this.state.rollover=='upvote'} opened={this.state.direction > 0}/>
              <span className='Dropdown-text'>Upvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <form className='Dropdown-form' action={'/vote/'+listing.name} method='post'>
            <input type='hidden' name='direction' value='-1'/>
            <MobileButton className='Dropdown-button' type='submit' onClick={this._onClick.bind(this, 'downvote')} over={this._onMouseEnter.bind(this, 'downvote')} out={this._onMouseLeave.bind(this, 'downvote')}>
              <DownvoteIcon hovered={this.state.rollover=='downvote'} opened={this.state.direction < 0}/>
              <span className='Dropdown-text'>Downvote</span>
            </MobileButton>
          </form>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={listing.permalink} over={this._onMouseEnter.bind(this, 'post')} out={this._onMouseLeave.bind(this, 'post')}>
            <UpvoteIcon hovered={this.state.rollover=='post'}/>
            <span className='Dropdown-text'>View comments</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={this._onClick.bind(this, 'save')} over={this._onMouseEnter.bind(this, 'save')} out={this._onMouseLeave.bind(this, 'save')}>
            <UpvoteIcon hovered={this.state.rollover=='save'}/>
            <span className='Dropdown-text'>Save</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={this._onClick.bind(this, 'gold')} over={this._onMouseEnter.bind(this, 'gold')} out={this._onMouseLeave.bind(this, 'gold')}>
            <GoldIcon opened={this.state.rollover=='gold'}/>
            <span className='Dropdown-text'>Give gold</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={this._onClick.bind(this, 'report')} over={this._onMouseEnter.bind(this, 'report')} out={this._onMouseLeave.bind(this, 'report')}>
            <UpvoteIcon hovered={this.state.rollover=='report'}/>
            <span className='Dropdown-text'>Report</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' onClick={this._onClick.bind(this, 'share')} over={this._onMouseEnter.bind(this, 'share')} out={this._onMouseLeave.bind(this, 'share')}>
            <UpvoteIcon hovered={this.state.rollover=='share'}/>
            <span className='Dropdown-text'>Share</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/r/' + listing.subreddit } over={this._onMouseEnter.bind(this, 'more')} out={this._onMouseLeave.bind(this, 'more')}>
            <UpvoteIcon hovered={this.state.rollover=='more'}/>
            <span className='Dropdown-text'>More from /r/{ listing.subreddit }</span>
          </MobileButton>
        </li>
        <li className='Dropdown-li'>
          <MobileButton className='Dropdown-button' href={ '/u/' + listing.author } over={this._onMouseEnter.bind(this, 'about')} out={this._onMouseLeave.bind(this, 'about')}>
            <UpvoteIcon hovered={this.state.rollover=='about'}/>
            <span className='Dropdown-text'>About /u/{ listing.author }</span>
          </MobileButton>
        </li>
      </Dropdown>
    );
  }

  _onMouseEnter(str) {
    this.setState({rollover:str});
  }

  _onMouseLeave(str) {
    this.setState({rollover:''});
  }

  _onClick(str, evt) {
    switch(str) {
      case 'upvote':
        evt.preventDefault();
        this.props.app.emit(Vote.VOTE+':'+this.props.listing.id, 1);
        break;
      case 'downvote':
        evt.preventDefault();
        this.props.app.emit(Vote.VOTE+':'+this.props.listing.id, -1);
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

  _onOpen ( bool ) {
    this.setState({opened:bool});
  }
}

function ListingDropdownFactory(app) {
  EllipsisIcon = EllipsisIconFactory(app);
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  GoldIcon = GoldIconFactory(app);
  Vote = VoteFactory(app);
  MobileButton = MobileButtonFactory(app);
  Dropdown = DropdownFactory(app);
  return app.mutate('core/components/ListingDropdown', ListingDropdown);
}

export default ListingDropdownFactory;
