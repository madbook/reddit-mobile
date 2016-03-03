import React from 'react'; // for type checking
import { models } from 'snoode';

import propTypes from '../../../propTypes';
import validatePropTypes from '../../../lib/validatePropTypes';
const T = React.PropTypes;

export default class VoteableBehaviorComponent {
  // we're a plain class, but we're going to use react proptypes for debug warnings
  // in this way a component can have vote arrows, but render them however
  // it chooses -- no overriding or css magic necessary

  static propTypes = {
    scoreChanged: T.func.isRequired,
    thing: propTypes.postOrComment.isRequired,
    app: T.object.isRequired,
    apiOptions: T.object.isRequired,
  };

  static voteDirectionFromThing(thing) {
    if (thing.likes === true) { return 1; }
    if (thing.likes === false) { return -1; }
    return 0;
  }

  constructor(scoreChanged, thing, app, apiOptions) {
    if (app && app.config && app.config.env === 'development') {
      validatePropTypes(
        VoteableBehaviorComponent.propTypes,
        {scoreChanged, thing, app, apiOptions},
        'VoteController'
      );
    }

    this.scoreChanged = scoreChanged;
    this.thing = thing;
    this.app = app;
    this.apiOptions = apiOptions;

    // state object just for reader clarity -- there's no React magic here
    this.state = {
      score: thing.score,
      voteDirection: VoteableBehaviorComponent.voteDirectionFromThing(thing),
    };
  }

  // external api for score / local score
  get score() {
    return this.state.score;
  }

  get voteDirection() {
    return this.state.voteDirection;
  }

  userCastVote(direction) {
    if (this.app.needsToLogInUser()) { return; }
    if (!this.castVote(direction)) { return; }

    const [newScore, voteDirection] = this.getScoresWithVote(direction);
    this.state.voteDirection = voteDirection;
    this.state.score = newScore;
    this.scoreChanged(this);
  }

  // internal voting

  castVote(direction) {
    if (this.voteDirection === direction) {
      direction = 0;
    }

    const voteOptions = this.buildApiOptionsForVote(direction);
    this.app.api.votes.post(voteOptions);
    return true;
  }

  buildApiOptionsForVote(direction) {
    const vote = new models.Vote({
      direction,
      id: this.thing.name,
    });

    const options = Object.assign(this.app.api.buildOptions(this.apiOptions), {
      model: vote,
      type: this.thing._type,
      score: this.getScoresWithVote(direction)[0],
    });

    return options;
  }

  getScoresWithVote(direction) {
    const undoingVote = (direction === this.state.voteDirection);
    const newVoteDirection = undoingVote ? 0 : direction;
    const newScore = undoingVote
      ? this.state.score - direction
      : this.state.score - this.state.voteDirection + direction;

    return [newScore, newVoteDirection];
  }
}
