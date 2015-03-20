import React from 'react';
import { models } from 'snoode';
import UpvoteIconFactory from '../components/UpvoteIcon';
var UpvoteIcon;
import DownvoteIconFactory from '../components/DownvoteIcon';
var DownvoteIcon;
import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

var d = new Date();
var year = d.getFullYear();

class Vote extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      score: this.props.thing.score,
      downvoted: this.props.thing.likes === false,
      upvoted: this.props.thing.likes === true,
      rollover: '',
    }

    this.upvote=this.upvote.bind(this);
    this.downvote=this.downvote.bind(this);
    this._onVote=this._onVote.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  upvote (e) {
    if(e)
      e.preventDefault();

    if (this.state.upvoted) {
      this.vote(0);
    } else {
      this.vote(1);
    }
  }

  downvote (e) {
    if(e)
      e.preventDefault();
    if (this.state.downvoted) {
      this.vote(0);
    } else {
      this.vote(-1);
    }
  }

  vote (direction) {
    var upvoted = false;
    var downvoted = false;
    var score = this.props.thing.score;
    switch (direction) {
      case -1:
        score = score - 1;
        downvoted = true;
        break;
      case 0:
        break;
      case 1:
        score = score + 1;
        upvoted = true;
        break;
    }

    this.props.app.emit(Vote.REMOTE_VOTE+':'+this.props.thing.id, direction);
    this.submitVote(direction);
    this.setState({
      upvoted: upvoted,
      downvoted: downvoted,
      score: score,
    });
  }

  submitVote (direction) {
    if (!this.props.token) {
      // TODO: replace this with login form
      console.warn('Must log in first.');
      return;
    }

    var vote = new models.Vote({
      direction: parseInt(direction),
      id: this.props.thing.name,
    });

    var options = this.props.api.buildOptions(this.props.token);

    options = Object.assign(options, {
      model: vote,
    });

    this.props.api.votes.post(options);
  }

  componentDidMount() {
    this.props.app.on(Vote.VOTE+':'+this.props.thing.id, this._onVote);
  }

  componentWillUnmount() {
    this.props.app.off(Vote.VOTE+':'+this.props.thing.id, this._onVote);
  }

  _onVote(dir) {
    if(dir==1)
      this.upvote();
    else
      this.downvote();
  }

  _onButtonMouseEnter(str) {
    this.setState({rollover:str});
  }

  _onButtonMouseLeave(str) {
    this.setState({rollover:''});
  }

  render () {
    var upvoteDirection = 1;
    var downvoteDirection = -1;

    if (this.state.upvoted) {
      upvoteDirection = 0;

    } else if (this.state.downvoted) {
      downvoteDirection = 0;
    }

    return (
        <ul className='linkbar linkbar-compact'>
          <li>
            <form className='vote-form' action={'/vote/'+this.props.thing.name} method='post'>
              <input type='hidden' name='direction' value='1'/>
              <MobileButton type='submit'
                className={'vote text-muted'} data-vote='up' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={ this.upvote } over={this._onButtonMouseEnter.bind(this, 'upvote')} out={this._onButtonMouseLeave.bind(this, 'upvote')}>
                <UpvoteIcon opened={this.state.upvoted} hovered={this.state.rollover=='upvote'}/>
              </MobileButton>
            </form>
          </li>
          <li className='vote-score-container'>
            <span className='vote-score' data-vote-score={this.state.score } data-thingid={ this.props.thing.name }>
              { this.state.score }
            </span>
          </li>
          <li>
            <form className='vote-form' action={'/vote/'+this.props.thing.name} method='post'>
              <input type='hidden' name='direction' value='-1'/>
              <MobileButton type='submit'
                className={'vote text-muted'} data-vote='down' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={ this.downvote } over={this._onButtonMouseEnter.bind(this, 'downvote')} out={this._onButtonMouseLeave.bind(this, 'downvote')}>
                <DownvoteIcon opened={this.state.downvoted} hovered={this.state.rollover=='downvote'}/>
              </MobileButton>
            </form>
          </li>
        </ul>
    );
  }
}

Vote.VOTE = 'voteVote';
Vote.REMOTE_VOTE = 'voteRemoteVote';

function VoteFactory(app) {
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  return app.mutate('core/components/vote', Vote);
}

export default VoteFactory;
