import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';
import { urlFromPage } from '@r/platform/pageUtils';

import Vote from 'app/components/Vote';

// import CommentDropdownContent from './CommentDropdownContent';
// import DropdownController from '../dropdown/DropdownController';

const T = React.PropTypes;

function onToggleDropdown () { console.log('toggle dropdown'); }

function renderReply ({ currentPage, id, commentReplying }) {
  const href = urlFromPage(currentPage, { queryParams: { commentReply: id } });

  let className = 'CommentTools__reply icon icon-reply2';

  if (commentReplying) {
    className += ' CommentTools__reply__replying';
  }

  return (
    <Anchor
      href= { href }
      className={ className }
    />
  );
}

function renderSeashells() {
  return (
    <div
      className='CommentTools__more icon icon-seashells'
      onClick={ onToggleDropdown }
    />
  );
}

function renderDivider() {
  return <div className='CommentTools__divider' />;
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
  const { score, scoreHidden, voteDirection, id } = props;

  return (
    <div className='CommentTools'>
      { renderReply(props) }
      { renderSeashells(props) }
      { renderDivider(props) }
      <Vote
        thingId={ id }
        classPrefix='CommentTools'
        score={ score }
        scoreHidden={ scoreHidden }
        voteDirection={ voteDirection }
      />
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
