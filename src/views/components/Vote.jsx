import React from 'react';
import { models } from 'snoode';
import constants from '../../constants';

import UpvoteIcon from '../components/icons/UpvoteIcon';
import DownvoteIcon from '../components/icons/DownvoteIcon';
import MobileButton from '../components/MobileButton';

class Vote extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      score: props.thing.score,
    };

    var likes = props.thing.likes;

    if (likes === false) {
      this.state.localScore = -1;
    } else if (likes === true) {
      this.state.localScore = 1;
    } else {
      this.state.localScore = 0;
    }

    this._onVote = this._onVote.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  componentDidMount() {
    this.props.app.on(constants.VOTE + ':' + this.props.thing.id, this._onVote);
  }

  componentWillUnmount() {
    this.props.app.off(constants.VOTE + ':' + this.props.thing.id, this._onVote);
  }

  _onClick(str, evt) {
    switch (str) {
      case 'upvote':
        evt.preventDefault();
        this.props.app.emit(constants.VOTE+':'+this.props.thing.id, 1);
        break;
      case 'downvote':
        evt.preventDefault();
        this.props.app.emit(constants.VOTE+':'+this.props.thing.id, -1);
        break;
    }
  }

  _onVote(dir) {
    if (this.submitVote(dir)) {
      var diff;
      var localScore;

      if (this.state.localScore === dir) {
        diff = dir * -1;
        localScore = 0;
      } else {
        diff = dir - this.state.localScore;
        localScore = dir;
      }

      var newScore = this.state.score + diff;

      this.setState({
        localScore: localScore,
        score: newScore,
      });

      if (this.props.setScore) {
        this.props.setScore(newScore);
      }
    }
  }

  submitVote(direction) {
    if (!this.props.token) {
      window.location = this.props.loginPath;
      return;
    }

    if (this.state.localScore === direction) {
      direction = 0;
    }

    var vote = new models.Vote({
      direction: parseInt(direction),
      id: this.props.thing.name,
    });

    var options = this.props.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: vote,
    });

    this.props.api.votes.post(options);
    this.props.app.emit('vote', vote);

    return true;
  }

  render() {
    if (this.state.localScore > 0) {
      var voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }

    return (
        <ul className='linkbar linkbar-compact'>
          <li>
            <form className='vote-form' action={'/vote/'+this.props.thing.name} method='post'>
              <input type='hidden' name='direction' value='1'/>
              <MobileButton type='submit'
                className={'vote text-muted ' + (voteClass || '')} data-vote='up' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={this._onClick.bind(this, 'upvote')}>
                <UpvoteIcon altered={this.state.localScore > 0}/>
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
                className={'vote text-muted ' + (voteClass || '')} data-vote='down' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={this._onClick.bind(this, 'downvote')}>
                <DownvoteIcon altered={this.state.localScore < 0}/>
              </MobileButton>
            </form>
          </li>
        </ul>
    );
  }
}

export default Vote;
