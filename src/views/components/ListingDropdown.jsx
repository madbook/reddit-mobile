import React from 'react';
import Utils from '../../lib/danehansen/Utils';
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

class ListingDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false,
      rollover:'',
    };
    var likes = this.props.listing.likes === true
    if (likes === true){
      this.state.direction=1;
    } else if (likes === false) {
      this.state.direction=-1;
    } else {
      this.state.direction=0;
    }
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onClick = this._onClick.bind(this);
    this._open = this._open.bind(this);
    this._close = this._close.bind(this);
    this._onRemoteVote = this._onRemoteVote.bind(this);
  }

  componentDidMount () {
    this.props.app.on(Vote.REMOTE_VOTE+':'+this.props.listing.id, this._onRemoteVote);
  }

  componentWillUnmount() {
    this.props.app.off(Vote.REMOTE_VOTE+':'+this.props.listing.id, this._onRemoteVote);
  }

  _onRemoteVote(direction) {
    this.setState({direction:direction});
  }

  render() {
    var touch=Utils.touch();
    var opened=this.state.opened;
    var listing=this.props.listing;
    return (
      <div className={'ListingDropdown dropdown right'+(opened?' opened':'')} onMouseEnter={touch?null:this._onMouseEnter} onMouseLeave={touch?null:this._onMouseLeave} onClick={touch?this._onClick:null}>
        <button><EllipsisIcon opened={opened}/></button>
        <div className='dropdown-tab shadow tween' ref='tab'>
          <div className='stalagmite right'></div>
          <ul className='dropdown-ul'>
            <li className='dropdown-li'>
              <form className='ListingDropdown-form' action={'/vote/'+listing.name} method='post'>
                <input type='hidden' name='direction' value='1'/>
                <MobileButton className='dropdown-button' type='submit' onClick={this._onButtonClick.bind(this, 'upvote')} over={this._onButtonMouseEnter.bind(this, 'upvote')} out={this._onButtonMouseLeave.bind(this, 'upvote')}>
                  <UpvoteIcon hovered={this.state.rollover=='upvote'} opened={this.state.direction > 0}/>
                  <span className='dropdown-text'>Upvote</span>
                </MobileButton>
              </form>
            </li>
            <li className='dropdown-li'>
              <form className='ListingDropdown-form' action={'/vote/'+listing.name} method='post'>
                <input type='hidden' name='direction' value='-1'/>
                <MobileButton className='dropdown-button' type='submit' onClick={this._onButtonClick.bind(this, 'downvote')} over={this._onButtonMouseEnter.bind(this, 'downvote')} out={this._onButtonMouseLeave.bind(this, 'downvote')}>
                  <DownvoteIcon hovered={this.state.rollover=='downvote'} opened={this.state.direction < 0}/>
                  <span className='dropdown-text'>Downvote</span>
                </MobileButton>
              </form>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' over={this._onButtonMouseEnter.bind(this, 'post')} out={this._onButtonMouseLeave.bind(this, 'post')}>
                <UpvoteIcon hovered={this.state.rollover=='post'}/>
                <span className='dropdown-text'>Post comment</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' onClick={this._onButtonClick.bind(this, 'save')} over={this._onButtonMouseEnter.bind(this, 'save')} out={this._onButtonMouseLeave.bind(this, 'save')}>
                <UpvoteIcon hovered={this.state.rollover=='save'}/>
                <span className='dropdown-text'>Save</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' onClick={this._onButtonClick.bind(this, 'gold')} over={this._onButtonMouseEnter.bind(this, 'gold')} out={this._onButtonMouseLeave.bind(this, 'gold')}>
                <GoldIcon opened={this.state.rollover=='gold'}/>
                <span className='dropdown-text'>Give gold</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' onClick={this._onButtonClick.bind(this, 'report')} over={this._onButtonMouseEnter.bind(this, 'report')} out={this._onButtonMouseLeave.bind(this, 'report')}>
                <UpvoteIcon hovered={this.state.rollover=='report'}/>
                <span className='dropdown-text'>Report</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' onClick={this._onButtonClick.bind(this, 'share')} over={this._onButtonMouseEnter.bind(this, 'share')} out={this._onButtonMouseLeave.bind(this, 'share')}>
                <UpvoteIcon hovered={this.state.rollover=='share'}/>
                <span className='dropdown-text'>Share</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' href={ '/r/' + listing.subreddit } over={this._onButtonMouseEnter.bind(this, 'more')} out={this._onButtonMouseLeave.bind(this, 'more')}>
                <UpvoteIcon hovered={this.state.rollover=='more'}/>
                <span className='dropdown-text'>More from { listing.subreddit }</span>
              </MobileButton>
            </li>
            <li className='dropdown-li'>
              <MobileButton className='dropdown-button' href={ '/u/' + listing.author } over={this._onButtonMouseEnter.bind(this, 'about')} out={this._onButtonMouseLeave.bind(this, 'about')}>
                <UpvoteIcon hovered={this.state.rollover=='about'}/>
                <span className='dropdown-text'>About { listing.author }</span>
              </MobileButton>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  _onMouseEnter() {
    this._open();
  }

  _onMouseLeave() {
    this._close();
  }

  _onClick() {
    if(this.state.opened)
      this._close();
    else
      this._open();
  }

  _open() {
    this.setState({opened:true});
  }

  _close() {
    this.setState({opened:false});
  }

  componentWillReceiveProps(nextProps) {
    var opened = nextProps.opened;
    if (typeof opened != 'undefined' && opened != this.state.opened)
      this._open(opened);
  }

  _onButtonMouseEnter(str) {
    this.setState({rollover:str});
  }

  _onButtonMouseLeave(str) {
    this.setState({rollover:''});
  }

  _onButtonClick(str, evt) {
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
}

function ListingDropdownFactory(app) {
  EllipsisIcon = EllipsisIconFactory(app);
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  GoldIcon = GoldIconFactory(app);
  Vote = VoteFactory(app);
  MobileButton = MobileButtonFactory(app);
  return app.mutate('core/components/ListingDropdown', ListingDropdown);
}

export default ListingDropdownFactory;