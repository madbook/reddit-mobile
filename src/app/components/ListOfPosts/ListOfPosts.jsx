import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Post from '../Post/Post';
import { map } from 'lodash/collection';

export class ListOfPosts extends React.Component {
  render() {
    const { postsList } = this.props;

    return (
      <div className='ListOfPosts'>
        { !postsList || postsList.loading
          ? this.renderLoading()
          : this.renderPostsList(postsList) }
      </div>
    );
  }

  renderLoading() {
    return <div className='ListOfPosts__loading' />;
  }

  renderPostsList(postsList) {
    return map(postsList.results, postRecord => {
      const postId = postRecord.uuid;

      return (
        <Post postId={ postId } key={ `post-id-${postId}` } />
      );
    });
  }
}

const listSelector = createSelector(
  (state, props) => props.postsListId,
  (state, props) => state.postsLists[props.postsListId],
  (postsListsId, postsList) => ({ postsListsId, postsList })
);

export default connect(listSelector)(ListOfPosts);
