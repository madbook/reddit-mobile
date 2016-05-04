import './Post.less';

import React from 'react';
import { Anchor } from '@r/platform/components';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

export class Post extends React.Component {
  render() {
    const { post } = this.props;

    return (
      <div className='Post'>
        <div className='Post__header'>
          { post.subreddit }
          { post.author }
        </div>
        <Anchor href={ post.cleanPermalink } />
        <Anchor href={ post.cleanUrl} />
        { post.selfText }
      </div>
    );
  }
}

const postSelector = createSelector(
  (state, props) => props.postId,
  (state, props) => state.posts[props.postId],
  ( postId, post) => ({ postId, post }),
);

export default connect(postSelector)(Post);
