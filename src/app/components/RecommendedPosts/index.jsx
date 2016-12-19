import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { PostsList } from 'app/components/PostsList';
import * as subredditsToPostsByPostActions from 'app/actions/subredditsToPostsByPost';

const T = React.PropTypes;

function RecommendedPosts(props) {
  const { posts, recommendedPostIds, trackPostRecommendationClick } = props;

  const hasRecommendations = recommendedPostIds.length > 0;
  let recommendedPosts = [];
  if (hasRecommendations) {
    recommendedPosts = Object.values(posts).filter(post => recommendedPostIds.includes(post.uuid));
  } else {
    return null;
  }

  return (
    <div className='RecommendedPosts__container'>
      <div className='RecommendedPosts__title'>
        <div className='title-text'>You May Also Like</div>
      </div>
      <hr/>
      <PostsList
        loading={ false }
        postRecords={ recommendedPosts }
        forceCompact
        onPostClick={ trackPostRecommendationClick }
      />
    </div>
  );
}

RecommendedPosts.propTypes = {
  posts: T.object.isRequired,
  recommendedPostIds: T.arrayOf(T.string).isRequired,
  trackPostRecommendationClick: T.func.isRequired,
};

const stateProps = createSelector(
  state => state.posts,
  (state, props) => {
    const postId = props.postId;
    const postLoaded = props.postLoaded;
    let recommendedPostIds = null;
    if (postLoaded && postId in state.subredditsToPostsByPost) {
      recommendedPostIds = state.subredditsToPostsByPost[postId];
    }
    if (postLoaded && postId in state.similarPosts) {
      recommendedPostIds = state.similarPosts[postId];
    }
    return recommendedPostIds;
  },
  (posts, recommendedPostIds) => {
    return {
      posts,
      recommendedPostIds: !recommendedPostIds ? [] : recommendedPostIds,
    };
  },
);

const dispatchProps = dispatch => ({
  trackPostRecommendationClick: post => dispatch(
    subredditsToPostsByPostActions.trackPostRecommendationClick(post)
  ),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    trackPostRecommendationClick,
  } = dispatchProps;

  return {
    ...stateProps,
    ...ownProps,
    trackPostRecommendationClick: post => { trackPostRecommendationClick(post); },
  };
};

export default connect(stateProps, dispatchProps, mergeProps)(RecommendedPosts);
