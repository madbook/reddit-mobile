import './styles.less';
import React from 'react';
import { METHODS } from '@r/platform/router';
import { Form } from '@r/platform/components';

const T = React.PropTypes;

export function scoreText(score, scoreHidden) {
  if (scoreHidden) {
    return '●';
  } else if (score < 1000) {
    return `${score}`;
  } else if (score < 1100) {
    return '1k';
  }

  return `${(score/1000).toFixed(1)}k`;
}

export function renderUpvote (props) {
  const { voteDirection, classPrefix } = props;
  let cls = `${classPrefix}__upvote icon icon-upvote`;
  const voteCls = voteDirection === -1 ? 'downvoted' : '';
  if (voteDirection === 1) { cls += ' m-animated upvoted'; }
  const formDirection = voteDirection === 1 ? 0 : 1;

  return (
    <Form
      action={ `/vote/${props.thingId}` }
      method={ METHODS.POST }
      className={ `Vote__form ${classPrefix}__Vote__form ${voteCls}` }
    >
      <input type='hidden' value={ formDirection } name='direction' />
      <button className={ cls } type='submit' />
    </Form>
  );
}

export function renderDownvote (props) {
  const { voteDirection, classPrefix } = props;
  const formDirection = voteDirection === -1 ? 0 : -1;

  let cls = `${classPrefix}__downvote icon icon-downvote`;
  const voteCls = voteDirection === -1 ? 'downvoted' : '';
  if (voteDirection === -1) { cls += ' m-animated downvoted'; }

  return (
    <Form
      action={ `/vote/${props.thingId}` }
      method={ METHODS.POST }
      className={ `Vote__form ${classPrefix}__Vote__form ${voteCls}` }
    >
      <input type='hidden' value={ formDirection } name='direction' />
      <button className={ cls } />
    </Form>
  );
}

export function renderScoreAndUpvote(props) {
  const { score, scoreHidden, voteDirection, onUpvote, classPrefix } = props;

  let textColorCls = '';
  if (voteDirection === 1) {
    textColorCls = 'upvoted';
  } else if (voteDirection === -1) {
    textColorCls = 'downvoted';
  }

  return (
    <div className={ `${classPrefix}__hit-area ${textColorCls}` } onClick={ onUpvote }>
      <div className={ `${classPrefix}__score ${textColorCls}` }>
        { scoreText(score, scoreHidden) }
      </div>
      { renderUpvote(props) }
    </div>
  );
}

export default function Vote(props) {
  return (
    <div className={ `Vote ${props.classPrefix}__Vote` }>
      { renderScoreAndUpvote(props) }
      { !props.hideDownvote && renderDownvote(props) }
    </div>
  );
}

Vote.propTypes = {
  thingId: T.string.isRequired,
  classPrefix: T.string,
  score: T.number.isRequired,
  scoreHidden: T.bool,
  voteDirection: T.number.isRequired,
  onUpvote: T.func,
  hideDownvote: T.bool,
};
