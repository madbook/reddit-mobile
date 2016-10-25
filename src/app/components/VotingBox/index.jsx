import './styles.less';
import React from 'react';
import { connect } from 'react-redux';

import cx from 'lib/classNames';
import * as votingActions from 'app/actions/vote';

const T = React.PropTypes;


function VotingBox(props) {
  const { voteDirection, score, scoreHidden, onVote } = props;

  const upvoteClass = cx('VotingBox__upvote icon icon-upvote', {
    'upvoted m-animated': voteDirection === 1,
  });

  const downvoteClass = cx('VotingBox__downvote icon icon-downvote', {
    'downvoted m-animated': voteDirection === -1,
  });

  const scoreClass = cx('VotingBox__score', {
    'upvoted': voteDirection === 1,
    'downvoted': voteDirection === -1,
  });

  const upVote = voteDirection === 1 ? 0 : 1;
  const downVote = voteDirection === -1 ? 0 : -1;

  return (
    <div className='VotingBox'>
      <div className={ upvoteClass } onClick={ () => onVote(upVote) } />
      <div className={ scoreClass }>{ scoreHidden ? '●' : score }</div>
      { props.hideDownvote
        ? null
        : <div className={ downvoteClass } onClick={ () => onVote(downVote) } />
      }
    </div>
  );
}

VotingBox.propTypes = {
  thingId: T.string.isRequired,
  score: T.number.isRequired,
  voteDirection: T.number.isRequired,
  hideDownvote: T.bool.isRequired,
  scoreHidden: T.bool,
};

VotingBox.defaultProps = {
  scoreHidden: false,
};

const mapDispatchToProps = (dispatch, { thingId }) => ({
  onVote: direction => dispatch(votingActions.vote(thingId, direction)),
});

export default connect(null, mapDispatchToProps)(VotingBox);
