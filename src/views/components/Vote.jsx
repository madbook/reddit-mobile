import React from 'react';
import { models } from 'snoode';

import constants from '../../constants';
import propTypes from '../../propTypes';

import BaseComponent from '../components/BaseComponent';

class Vote extends BaseComponent {
  static propTypes = {
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

    const likes = props.thing.likes;

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
    this.props.app.on(`${constants.VOTE}:${this.props.thing.id}`, this._onVote);
  }

  componentWillUnmount() {
    this.props.app.off(`${constants.VOTE}:${this.props.thing.id}`, this._onVote);
  }

  _onClick(str, evt) {
    switch (str) {
      case 'upvote':
        evt.preventDefault();
        this.props.app.emit(`${constants.VOTE}:${this.props.thing.id}`, 1);
        break;
      case 'downvote':
        evt.preventDefault();
        this.props.app.emit(`${constants.VOTE}:${this.props.thing.id}`, -1);
        break;
    }
  }

  _getScore(dir) {
    let diff;
    let localScore;

    if (this.state.localScore === dir) {
      diff = dir * -1;
      localScore = 0;
    } else {
      diff = dir - this.state.localScore;
      localScore = dir;
    }

    const newScore = this.state.score + diff;
    return [newScore, localScore];
  }

  _onVote(dir) {
    if (this.submitVote(dir)) {
      const [newScore, localScore] = this._getScore(dir);

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
    if (this.props.app.needsToLogInUser()) { return; }

    if (this.state.localScore === direction) {
      direction = 0;
    }

    const vote = new models.Vote({
      direction: parseInt(direction),
      id: this.props.thing.name,
    });

    let options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: vote,
    });

    options.type = this.props.thing._type;
    options.score = this._getScore(direction)[0];

    this.props.app.api.votes.post(options);
    this.props.app.emit('vote', vote);

    return true;
  }

  get voteClass() {
    let voteClass = '';
    if (this.state.localScore > 0) {
      voteClass = ' upvoted';
    } else if (this.state.localScore < 0) {
      voteClass = ' downvoted';
    }
    return voteClass;
  }

  renderUpvote() {
    const { thing } = this.props;
    return (
      <li>
        <form
          className='vote-form'
          action={ `/vote/${thing.name}` }
          method='post'
        >
          <input type='hidden' name='direction' value='1'/>
          <button
            type='submit'
            className={ `vote text-muted ${this.voteClass}` }
            data-vote='up'
            data-thingid={ thing.name }
            data-no-route='true'
            onClick={ this.upvote }
          >
            <span className='icon-upvote-circled'/>
          </button>
        </form>
      </li>
    );
  }

  renderDownvote() {
    const { thing } = this.props;
    return (
      <li>
        <form
          className='vote-form'
          action={ `/vote/${thing.name}` }
          method='post'
        >
          <input type='hidden' name='direction' value='-1'/>
          <button
            type='submit'
            className={ `vote text-muted ${this.voteClass}` }
            data-vote='down'
            data-thingid={ thing.name }
            data-no-route='true'
            onClick={ this.downvote }
          >
            <span className='icon-downvote-circled'/>
          </button>
        </form>
      </li>
    );
  }

  renderVoteCount() {
    const { thing } = this.props;
    const score = thing.hide_score || thing.score_hidden ? '●' : this.state.score;

    return (
      <li className='vote-score-container'>
        <span
          className='vote-score'
          data-vote-score={ this.state.score }
          data-thingid={ this.props.thing.name }
        >
          { score }
        </span>
      </li>
    );
  }

  render() {
    return (
      <ul className='linkbar linkbar-compact'>
        { this.renderUpvote() }
        { this.renderVoteCount() }
        { this.renderDownvote() }
      </ul>
    );
  }
}

export default Vote;
