import React from 'react';
import { models } from 'snoode';

var d = new Date();
var year = d.getFullYear();

class Vote extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      score: this.props.thing.score,
      downvoted: this.props.thing.likes === false,
      upvoted: this.props.thing.likes === true,
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  upvote (e) {
    e.preventDefault();

    if (this.state.upvoted) {
      this.vote(0);
    } else {
      this.vote(1);
    }
  }

  downvote (e) {
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

  render () {
    var upvotedClass = '';
    var downvotedClass = '';
    var upvoteDirection = 1;
    var downvoteDirection = -1;

    if (this.state.upvoted) {
      upvotedClass = ' voted text-upvote';
      upvoteDirection = 0;
    } else if (this.state.downvoted) {
      downvotedClass = ' voted text-downvote';
      downvoteDirection = 0;
    }

    return (
      <ul className='linkbar linkbar-compact'>
        <li>
          <a href={ '/vote/' + this.props.thing.name + '?direction=' + upvoteDirection }
            className={'vote text-muted' + upvotedClass } data-vote='up' data-thingid={ this.props.thing.name }
            data-no-route='true' onClick={ this.upvote.bind(this) }>
            <span className='glyphicon glyphicon-circle-arrow-up'></span>
          </a>
        </li>
        <li>
          <span className='vote-score' data-vote-score={this.state.score } data-thingid={ this.props.thing.name }>
            { this.state.score }
          </span>
        </li>
        <li>
          <a href={ '/vote/' + this.props.thing.name + '?direction=' + downvoteDirection }
            className={'vote text-muted' + downvotedClass } data-vote='down' data-thingid={ this.props.thing.name }
            data-no-route='true' onClick={ this.downvote.bind(this) }>
            <span className='glyphicon glyphicon-circle-arrow-down'></span>
          </a>
        </li>
      </ul>
    );
  }
}

function VoteFactory(app) {
  return app.mutate('core/components/vote', Vote);
}

export default VoteFactory;
