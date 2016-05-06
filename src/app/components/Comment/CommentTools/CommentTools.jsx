import './CommentTools.less';
import React from 'react';

// import CommentDropdownContent from './CommentDropdownContent';
// import DropdownController from '../dropdown/DropdownController';

const T = React.PropTypes;

function scoreText(score, scoreHidden) {
  if (scoreHidden) {
    return '–';
  } else if (score < 1000) {
    return `${score}`;
  } else if (score < 1100) {
    return '1k';
  }

  return `${(score/1000).toFixed(1)}k`;
}

function renderReply () {
  /*
  return (
    <div
      className='CommentTools__reply icon icon-reply2'
      onClick={ onToggleReplyForm }
    />
  );
  */
}

function renderSeashells() {
  /*
  return (
    <div
      className='CommentTools__more icon icon-seashells'
      onClick={ this.toggleDropdown }
    />
  );
  */
}

function renderDivider() {
  return <div className='CommentTools__divider' />;
}

function renderScoreAndUpvote(props) {
  const { score, scoreHidden, voteDirection, onUpvote } = props;

  let textColorCls;
  if (voteDirection === 1) {
    textColorCls = 'upvoted';
  } else if (voteDirection === -1) {
    textColorCls = 'downvoted';
  }

  return (
    <div className={ `CommentTools__hit-area ${textColorCls}` } onClick={ onUpvote }>
      <div className={ `CommentTools__score ${textColorCls}` }>
        { scoreText(score, scoreHidden) }
      </div>
      { renderUpvote(props) }
    </div>
  );
}

function renderUpvote (props) {
  const { voteDirection } = props;
  let cls = 'CommentTools__upvote icon icon-upvote';
  if (voteDirection === 1) { cls += ' m-animated'; }

  return <div className={ cls } />;
}

function renderDownvote (props) {
  const { onDownvote, voteDirection } = props;

  let cls = 'CommentTools__downvote icon icon-downvote';
  const voteCls = voteDirection === -1 ? 'downvoted' : '';
  if (voteDirection === -1) { cls += ' m-animated'; }

  return (
    <div className={ `CommentTools__hit-area ${voteCls}` } onClick={ onDownvote } >
      <div className={ cls } />
    </div>
  );
}

function renderDropdown(/*props*/) {
  return <div />;

  /*
  const { commentAuthor, username, app, saved, permalinkUrl, dropdownTarget } = props;
  return (
    <DropdownController
      target={ dropdownTarget }
      onClose={ toggleDropdown }
      app={ app }
      offset={ 8 }
      >
      <CommentDropdownContent
        username={ commentAuthor }
        userOwned={ username === commentAuthor }
        userLoggedIn={ !!username }
        saved={ saved }
        permalinkUrl={ permalinkUrl }
      />
    </DropdownController>
  );
  */
}

export default function CommentTools (props) {
  return (
    <div className='CommentTools'>
      { renderReply(props) }
      { renderSeashells(props) }
      { renderDivider(props) }
      { renderScoreAndUpvote(props) }
      { renderDownvote(props) }
      { props.dropdownTarget ? renderDropdown(props) : null }
    </div>
  );
}

CommentTools.propTypes = {
  score: T.number.isRequired,
  app: T.object.isRequired,
  commentAuthor: T.string.isRequired,
  username: T.string, // The user's name
  scoreHidden: T.bool,
  voteDirection: T.number,
  saved: T.bool,
  permalinkUrl: T.string,
};

CommentTools.defaultProps = {
  voteDirection: 0,
  scoreHidden: false,
  saved: false,
  permalinkUrl: '',
};
