import React from 'react';
import { models } from 'snoode';

import constants from '../../constants';
import propTypes from '../../propTypes';

import BaseComponent from '../components/BaseComponent';

class Vote extends BaseComponent {
  static propTypes = {
    // apiOptions: React.PropTypes.object,
    setScore: React.PropTypes.func,
    thing: React.PropTypes.oneOfType([
      propTypes.comment,
      propTypes.listing,
    ]).isRequired,
  };
  
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
    this.upvote = this._onClick.bind(this, 'upvote');
    this.downvote = this._onClick.bind(this, 'downvote');
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

  _getScore(dir) {
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
    return [newScore, localScore];
  }

  _onVote(dir) {
    if (this.submitVote(dir)) {
      var [newScore, localScore] = this._getScore(dir);

      this.setState({
        localScore,
        score: newScore,
      });

      if (this.props.setScore) {
        this.props.setScore(newScore);
      }
    }
  }

  submitVote(direction) {
    if (!this.props.token) {
      window.location = this.props.app.config.loginPath;
      return;
    }

    if (this.state.localScore === direction) {
      direction = 0;
    }

    var vote = new models.Vote({
      direction: parseInt(direction),
      id: this.props.thing.name,
    });

    var options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: vote,
    });

    options.type = this.props.thing._type;
    options.score = this._getScore(direction)[0];

    this.props.app.api.votes.post(options);
    this.props.app.emit('vote', vote);

    return true;
  }

  render() {
    var voteClass = '';
    if (this.state.localScore > 0) {
      voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }

    const { thing } = this.props;
    const score = thing.hide_score || thing.score_hidden ? '●' : this.state.score;

    return (
        <ul className='linkbar linkbar-compact'>
          <li>
            <form
              className='vote-form'
              action={ '/vote/'+ thing.name }
              method='post'
            >
              <input type='hidden' name='direction' value='1'/>
              <button
                type='submit'
                className={ 'vote text-muted ' + (voteClass || '') }
                data-vote='up'
                data-thingid={ thing.name }
                data-no-route='true'
                onClick={ this.upvote }
              >
                <span className='icon-upvote-circled'></span>
              </button>
            </form>
          </li>
          <li className='vote-score-container'>
            <span
              className='vote-score'
              data-vote-score={ this.state.score }
              data-thingid={ this.props.thing.name }
            >
              { score }
            </span>
          </li>
          <li>
            <form
              className='vote-form'
              action={ '/vote/'+ thing.name }
              method='post'
            >
              <input type='hidden' name='direction' value='-1'/>
              <button
                type='submit'
                className={ 'vote text-muted ' + (voteClass || '') }
                data-vote='down'
                data-thingid={ thing.name }
                data-no-route='true'
                onClick={ this.downvote }
              >
                <span className='icon-downvote-circled'></span>
              </button>
            </form>
          </li>
        </ul>
    );
  }
}

export default Vote;
