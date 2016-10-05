import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { BackAnchor } from '@r/platform/components';

import ThreadMessage from './Message';

const T = React.PropTypes;

export function MessageThread(props) {
  const {
    messages,
    threadId,
  } = props;
  const head = messages[`t4_${threadId}`];

  return (
    <div className='MessageThread'>
      <div className='MessageThread__header'>
        <BackAnchor
          className='MessageThread__backlink icon icon-x'
          href="/message/messages/"
        />
        <div className='MessageThread__subject'>
          { head.subject }
        </div>
      </div>
      <div className='MessageThread__divider' />
      <div className='MessageThread__content'>
        { renderMessage(head) }
        { head.replies.map(reply => renderMessage(messages[reply])) }
      </div>
    </div>
  );
}

const renderMessage = message => {
  return (
    <div className='MessageThread__item'>
      <ThreadMessage message={ message } />
    </div>
  );
};

MessageThread.propTypes = {
  messages: T.object.isRequired,
  threadId: T.string.isRequired,
};

const selector = createSelector(
  state => state.messages,
  messages => ({
    messages,
  })
);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  threadId: ownProps.urlParams.threadId,
});

export default connect(selector, null, mergeProps)(MessageThread);
