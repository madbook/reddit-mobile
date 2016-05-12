import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Post from '../Post';
import Loading from '../Loading';

import { map } from 'lodash/collection';

export function PostsList (props) {
  const { postsList } = props;

  return (
    <div className='PostsList PostAndCommentList'>
      { !postsList || postsList.loading
        ? renderLoading()
        : renderPostsList(postsList) }
    </div>
  );
}

function renderLoading() {
  return <Loading />;
}

function renderPostsList(postsList) {
  return map(postsList.results, postRecord => {
    const postId = postRecord.uuid;

    return (
      <Post postId={ postId } key={ `post-id-${postId}` } />
    );
  });
}

const listSelector = createSelector(
  (state, props) => props.postsListId,
  (state, props) => state.postsLists[props.postsListId],
  (postsListsId, postsList) => ({ postsListsId, postsList })
);

export default connect(listSelector)(PostsList);
