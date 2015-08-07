import React from 'react';
import { models } from 'snoode';
import constants from '../../constants';
import globals from '../../globals';
import propTypes from '../../propTypes';

import BaseComponent from '../components/BaseComponent';
import MobileButton from '../components/MobileButton';

class Vote extends BaseComponent {
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

  componentDidMount() {
    globals().app.on(constants.VOTE + ':' + this.props.thing.id, this._onVote);
  }

  componentWillUnmount() {
    globals().app.off(constants.VOTE + ':' + this.props.thing.id, this._onVote);
  }

  _onClick(str, evt) {
    switch (str) {
      case 'upvote':
        evt.preventDefault();
        globals().app.emit(constants.VOTE+':'+this.props.thing.id, 1);
        break;
      case 'downvote':
        evt.preventDefault();
        globals().app.emit(constants.VOTE+':'+this.props.thing.id, -1);
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
      window.location = globals().loginPath;
      return;
    }

    if (this.state.localScore === direction) {
      direction = 0;
    }

    var vote = new models.Vote({
      direction: parseInt(direction),
      id: this.props.thing.name,
    });

    var options = globals().api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: vote,
    });

    globals().api.votes.post(options);
    globals().app.emit('vote', vote);

    return true;
  }

  render() {
    var voteClass = '';
    if (this.state.localScore > 0) {
      voteClass = ' upvoted';
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
              <span className='icon-upvote-circled'></span>
              </MobileButton>
            </form>
          </li>
          <li className='vote-score-container'>
            <span className='vote-score' data-vote-score={this.state.score } data-thingid={ this.props.thing.name }>
              { this.props.thing.hide_score || this.props.thing.score_hidden ? '●' : this.state.score }
            </span>
          </li>
          <li>
            <form className='vote-form' action={'/vote/'+this.props.thing.name} method='post'>
              <input type='hidden' name='direction' value='-1'/>
              <MobileButton type='submit'
                className={'vote text-muted ' + (voteClass || '')} data-vote='down' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={this._onClick.bind(this, 'downvote')}>
                <span className='icon-downvote-circled'></span>
              </MobileButton>
            </form>
          </li>
        </ul>
    );
  }
}

Vote.propTypes = {
  // apiOptions: React.PropTypes.object,
  setScore: React.PropTypes.func,
  thing: React.PropTypes.oneOfType([
    propTypes.comment,
    propTypes.listing,
  ]).isRequired,
};

export default Vote;
