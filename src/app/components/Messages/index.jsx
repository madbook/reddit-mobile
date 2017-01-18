import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import PaginationButtons from 'app/components/PaginationButtons';

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
    currentPage,
    mailData,
    mailType,
  } = props;
  const { meta } = mailData;
  const { prevUrl, nextUrl } = getPaginationUrls(currentPage, meta);

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
      <PaginationButtons
        compact={ true }
        preventUrlCreation={ true }
        prevUrl={ prevUrl }
        nextUrl={ nextUrl }
      />
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

const getPaginationUrls = (currentPage, meta) => {
  const { url } = currentPage;
  const { before, after } = meta;
  const ret = {};
  if (before) {
    ret.prevUrl = `${url}?count=25&before=${before}`;
  }
  if (after) {
    ret.nextUrl = `${url}?count=25&after=${after}`;
  }
  return ret;
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
  state => state.comments.data,
  state => state.posts,
  state => state.platform.currentPage,
  (state, ownProps) => state.mail[ownProps.urlParams.mailType],
  (messages, comments, posts, currentPage, mailData) => ({
    messages,
    comments,
    posts,
    currentPage,
    mailData,
  })
);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  mailType: ownProps.urlParams.mailType,
});

export default connect(selector, null, mergeProps)(Messages);
