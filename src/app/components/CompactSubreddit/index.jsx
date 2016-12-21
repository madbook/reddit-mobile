import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import random from 'lodash/random';

import Logo from 'app/components/Logo';
import SnooIcon from 'app/components/SnooIcon';
import { paramsToPostsListsId } from 'app/models/PostsList';
import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import getSubreddit from 'lib/getSubredditFromState';

const getRandomSnoo = () => {
  const value = random(1, 9);
  return `/img/snoo${ value }.png`;
};

const MiniPost = (props) => {
  const { post } = props;
  if (post === null) {
    return <div className='MiniPost empty' />;
  }
  let backgroundUrl;
  if (post.thumbnail && post.thumbnail.startsWith('http')) {
    backgroundUrl = post.thumbnail;
  } else {
    backgroundUrl = getRandomSnoo();
  }
  return (
    <div className='MiniPost'>
      <div className='MiniPost__thumbnail-wrapper' >
        <div className='MiniPost__thumbnail'
             style={ { backgroundImage: `url(${backgroundUrl})` } }
        />
      </div>
      <div className='MiniPost__text'>
        { post.title }
      </div>
    </div>
  );
};


const CompactSubreddit = (props) => {
  const { subredditName, posts, bannerImage } = props;
  let banner;
  if (bannerImage) {
    banner = (
      <div className='CompactSubreddit__banner__community'
           style={ { backgroundImage: `url(${bannerImage})` } }
      />
    );
  } else {
    banner = (
      <div className='CompactSubreddit__banner__generic' >
        <SnooIcon />
        <Logo />
      </div>
    );
  }
  return (
    <div className='CompactSubreddit'>
      <div className='CompactSubreddit__banner'>
        { banner }
      </div>
      <div className='CompactSubreddit__name'>
        { `r/${subredditName}` }
      </div>
      <div className='CompactSubreddit__posts'>
        { posts.map((post) => <MiniPost post={ post } />) }
      </div>
    </div>
  );
};

const forceLength = (array, length) => {
  const out = [];
  for (let i = 0; i < length; ++i) {
    if (array.length > i) {
      out.push(array[i]);
    } else {
      out.push(null);
    }
  }
  return out;
};

export const selector = createSelector(
  getSubreddit,
  state => state.subreddits,
  state => state.postsLists,
  state => state.posts,
  state => state.platform.currentPage,
  (subredditName, subreddits, postsLists, posts, currentPage) => {
    let allPosts = [];
    // For subreddit listings, we use the listing data we're already
    // grabbing and return the thumbnails if we have enough
    let hash = null;

    const { urlParams, queryParams } = currentPage;
    const getPageParams = PostsFromSubreddit.pageParamsToSubredditPostsParams;
    const pageParams = getPageParams({ urlParams, queryParams });
    hash = paramsToPostsListsId(pageParams);
    const postsList = hash && postsLists[hash];

    if (postsList && !postsList.loading) {
      // We have posts!  Look for thumbails, stripping out nsfw, stickied, etc.
      const uuids = postsList.results.map(item => item.uuid);
      allPosts = uuids
        .map(uuid => posts[uuid])
        .filter(post => !post.over18)
        .filter(post => !post.stickied);
    }
    const bannerImage = subreddits[subredditName] ?
                        subreddits[subredditName].bannerImage : null;
    return {
      posts: forceLength(allPosts, 4),
      bannerImage,
      subredditName,
    };
  },
);


export default connect(selector)(CompactSubreddit);
