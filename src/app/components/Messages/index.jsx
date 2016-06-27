import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import MessagesHeader from './Header';
import MessagesNav from './Nav';
import MessagesComment from './Comment';
import MessagesMessage from './Message';
import MessagesPost from './Post';

const T = React.PropTypes;

export function Messages(props) {
  const {
    messages,
    comments,
    posts,
    mailData,
    mailType,
  } = props;

  return (
    <div className='Messages'>
      <div className='Messages__header'>
        <MessagesHeader/>
      </div>
      <div className='Messages__nav'>
        <MessagesNav currentMailType={ mailType }/>
      </div>
      <div className='Messages__divider'/>
      <div className='Messages__content'>
        { mailData.order.map(({ type, uuid }) => (
          <div className='Messages__item'>
            { renderItem(type, uuid, messages, comments, posts) }
          </div>
        )) }
      </div>
    </div>
  );
}

Messages.propTypes = {
  messages: T.object.isRequired,
  comments: T.object.isRequired,
  posts: T.object.isRequired,
  mailData: T.object.isRequired,
  mailType: T.string.isRequired,
};

const renderItem = (type, id, messages, comments, posts) => {
  switch (type) {
    case 'comment':
      return <MessagesComment comment={ comments[id] }/>;
    case 'message':
      return <MessagesMessage message={ messages[id] }/>;
    case 'post':
      return <MessagesPost post={ posts[id] }/>;
    default:
      return null;
  }
};

const selector = createSelector(
  state => state.messages,
  state => state.comments,
  state => state.posts,
  (state, ownProps) => state.mail[ownProps.urlParams.mailType],
  (messages, comments, posts, mailData) => ({
    messages,
    comments,
    posts,
    mailData,
  })
);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  mailType: ownProps.urlParams.mailType,
});

export default connect(selector, null, mergeProps)(Messages);
