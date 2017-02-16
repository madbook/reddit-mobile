import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from '@r/platform/components';
import * as subredditsByPostActions from 'app/actions/subredditsByPost';

const T = React.PropTypes;

function RecommendedSubreddits(props) {
  const { subreddits, recommendedSubredditIds, trackSubredditRecommendationClick } = props;

  const hasRecommendations = recommendedSubredditIds.length > 0;
  let recommendedSubreddits = [];
  if (hasRecommendations) {
    recommendedSubreddits = Object.values(subreddits).filter(subreddit => recommendedSubredditIds.includes(subreddit.uuid));
  } else {
    return null;
  }

  const title = [
    <div className='RecommendedSubreddits__title'>
      <div className='title-text'>You May Also Like</div>
    </div>,
    <hr/>,
  ];

  const subredditListing = recommendedSubreddits.map((sr) => {
    const withBackground = { 
      'backgroundImage': `url(${sr.iconImage})`,
      'backgroundPosition': '-1px 0px',
    };
    const subIconStyle = Object.assign({ 'backgroundColor': sr.keyColor },
      sr.iconImage ? withBackground : {}
    );
    return (
      <div className='RecommendedSubreddits__top'>
        <div
          className='subreddit-icon-image'
          style={ subIconStyle }
        />
        <div className='RecommendedSubreddits__SubredditInfo'>
          <Anchor
            href={ sr.url }
            className='sr-url'
            onClick={ () => trackSubredditRecommendationClick(sr) }
          >
            { formatSubredditHref(sr.url) }
          </Anchor>
          <div className='sr-subscriber-count'>
            { `${Number(sr.subscribers).toLocaleString('en') +
              (sr.subscribers > 1 ? ' people' : ' person') } subscribed to ${ sr.displayName}` }
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className='RecommendedSubreddits__container'>
      { title }
      { subredditListing }
    </div>
  );
}

RecommendedSubreddits.propTypes = {
  subreddits: T.object.isRequired,
  recommendedSubredditIds: T.arrayOf(T.string).isRequired,
  trackSubredditRecommendationClick: T.func.isRequired,
};

const formatSubredditHref = (url) => {
  // remove leading & trailing slash if they exist
  return url.replace(/^\//, '').replace(/\/$/, '');
};

const stateProps = createSelector(
  state => state.subreddits,
  (state, props) => {
    const postId = props.postId;
    const postLoaded = props.postLoaded;
    let recommendedSubredditIds = null;
    if (postLoaded && postId in state.subredditsByPost) {
      recommendedSubredditIds = state.subredditsByPost[postId];
    }
    return recommendedSubredditIds;
  },
  (subreddits, recommendedSubredditIds) => {
    return {
      subreddits,
      recommendedSubredditIds: !recommendedSubredditIds ? [] : recommendedSubredditIds,
    };
  },
);

const dispatchProps = dispatch => ({
  trackSubredditRecommendationClick: subreddit => dispatch(
    subredditsByPostActions.trackSubredditRecommendationClick(subreddit)
  ),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    trackSubredditRecommendationClick,
  } = dispatchProps;

  return {
    ...stateProps,
    ...ownProps,
    trackSubredditRecommendationClick: subreddit => { trackSubredditRecommendationClick(subreddit); },
  };
};

export default connect(stateProps, dispatchProps, mergeProps)(RecommendedSubreddits);
