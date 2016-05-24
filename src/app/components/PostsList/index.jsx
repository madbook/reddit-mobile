import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Post from 'app/components/Post';
import Loading from 'app/components/Loading';

import { map } from 'lodash/collection';

export function PostsList (props) {
  const { loading, postRecords } = props;

  return (
    <div className='PostsList PostAndCommentList'>
      { loading ? renderLoading() : renderPostsList(postRecords) }
    </div>
  );
}

const renderLoading = () => {
  return <Loading />;
};

const renderPostsList = (records) => {
  return map(records, postRecord => {
    const postId = postRecord.uuid;

    return (
      <Post postId={ postId } key={ `post-id-${postId}` } />
    );
  });
};

const listSelector = createSelector(
  (state, props) => state.postsLists[props.postsListId],
  (postsList) => ({
    loading: postsList && postsList.loading,
    postRecords: postsList ? postsList.results : [],
  }),
);

export default connect(listSelector)(PostsList);
