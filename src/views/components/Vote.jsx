import React from 'react';
import { models } from 'snoode';
import constants from '../../constants';

import UpvoteIconFactory from '../components/icons/UpvoteIcon';
var UpvoteIcon;
import DownvoteIconFactory from '../components/icons/DownvoteIcon';
var DownvoteIcon;
import MobileButtonFactory from '../components/MobileButton';
var MobileButton;

class Vote extends React.Component {
  constructor(props) {
    super(props);

    this._score = props.thing.score;

    this.state = {
      score: this._score,
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
    this.props.app.on(constants.VOTE+':'+this.props.thing.id, this._onVote);
  }

  componentWillUnmount() {
    this.props.app.off(constants.VOTE+':'+this.props.thing.id, this._onVote);
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
    var localScore = Math.min(1, Math.max(-1, dir - this.state.localScore));
    this.setState({localScore: localScore, score: this._score + localScore});
    this.submitVote(localScore);
  }

  submitVote(direction) {
    if (!this.props.token) {
      window.location = this.props.loginPath;
      return;
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
                className={'vote text-muted' + voteClass} data-vote='up' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={this._onClick.bind(this, 'upvote')}>
                <UpvoteIcon altered={this.state.localScore > 0} />
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
                className={'vote text-muted' + voteClass} data-vote='down' data-thingid={ this.props.thing.name }
                data-no-route='true' onClick={this._onClick.bind(this, 'downvote')}>
                <DownvoteIcon altered={this.state.localScore < 0}/>
              </MobileButton>
            </form>
          </li>
        </ul>
    );
  }
}

function VoteFactory(app) {
  UpvoteIcon = UpvoteIconFactory(app);
  DownvoteIcon = DownvoteIconFactory(app);
  MobileButton = MobileButtonFactory(app);
  return app.mutate('core/components/vote', Vote);
}

export default VoteFactory;
