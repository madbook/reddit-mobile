/* eslint-disable react/jsx-curly-spacing */

import React from 'react';
import { createSelector } from 'reselect';

import { flags } from 'app/constants';
import { getDevice } from 'lib/getDeviceFromState';
import getSubreddit from 'lib/getSubredditFromState';
import { getBranchLink } from 'lib/smartBannerState';

import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { featuresSelector} from 'app/selectors/features';

const T = React.PropTypes;

const {
  VARIANT_XPROMO_SUBREDDIT,
} = flags;

const THUMBNAIL_THRESHOLD = 9;

function List() {
  return (
    <div className='InterstitialListing__bulletList'>
      <div className='InterstitialListing__bulletItem'>
        <span className='InterstitialListing__bulletIcon icon icon-controversial' />
        50% Faster
      </div>
      <div className='InterstitialListing__bulletItem'>
        <span className='InterstitialListing__bulletIcon icon icon-compact' />
        Infinite Scroll
      </div>
      <div className='InterstitialListing__bulletItem'>
        <span className='InterstitialListing__bulletIcon icon icon-play_triangle' />
        Autoplay GIFs
      </div>
    </div>
  );
}

export function InterstitialListingCommon(props) {
  /* NOTE: We default to the VARIANT_XPROMO_CLICK case because
   * it breaks otherwise when we navigate off a listing page.
   */
  const { urls, onClose, features, thumbnails, navigator } = props;

  const titleText = features.enabled(VARIANT_XPROMO_SUBREDDIT)
    ? ''
    : 'View this post in the official Reddit app';

  const subtitleText = features.enabled(VARIANT_XPROMO_SUBREDDIT)
    ? 'Reddit is better with the app. We hate to intrude, ' +
      'but you deserve the best.'
    : '';

  const buttonText = 'Continue';

  return (
    <div className='InterstitialListing__common'>
      <div className='InterstitialListing__header'>
        { renderImageContent(thumbnails) }
      </div>
      <div className='InterstitialListing__bottom'>
        <div className='InterstitialListing__bottomContent'>
          <div className='InterstitialListing__title'>
            { titleText }
          </div>
          <div className='InterstitialListing__subtitle'>
            { subtitleText }
          </div>
          <List />
          <div
            className='InterstitialListing__button'
            onClick={ navigator(urls[0]) }
          >
            { buttonText }
          </div>
          <div className='InterstitialListing__dismissal'>
            <span className='InterstitialListing__dismissalText'>
              { 'or go to the '}
            </span>
            <a className='InterstitialListing__dismissalLink' onClick={ onClose }>
              mobile site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const renderImageContent = thumbnails => {
  if (thumbnails) {
    return (
      <div className='InterstitialListing__thumbnailGrid'>
        { thumbnails.map(tn =>
          <div className='InterstitialListing__thumbnailWrapper' key={ tn }>
            <div
              className='InterstitialListing__thumbnail'
              style={ { backgroundImage: `url(${tn})` }}
            />
          </div>
        ) }
      </div>
    );
  }

  // explicitly null means we don't have thumbnails
  // only render the image in this case to prevent pop-in
  if (thumbnails === null) {
    return (
      <div className='InterstitialListing__appPreview'>
        <div className='InterstitialListing__appPreviewImage' />
      </div>
    );
  }

  return <div className='InterstitialListing__headerPlaceholder' />;
};

InterstitialListingCommon.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

function getUrls(state) {
  return [
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_1',
    }),
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_2',
    }),
  ];
}

export const selector = createSelector(
  getUrls,
  featuresSelector,
  getDevice,
  getSubreddit,
  state => state.subreddits,
  state => state.postsLists,
  state => state.posts,
  state => state.modal,
  state => state.platform.currentPage,
  (
    urls,
    features,
    device,
    subredditName,
    subreddits,
    postsLists,
    posts,
    modal,
    currentPage,
  ) => {
    let thumbnails;
    let over18 = false;

    const subredditInfo = subreddits[subredditName.toLowerCase()];
    if (subredditInfo) {
      over18 = subredditInfo.over18;
    }

    // For subreddit listings, we use the listing data we're already
    // grabbing and return the thumbnails if we have enough
    let hash = null;
    if (modal.type) {
      // In modal mode, we get the hash set at the time it's activated
      hash = modal.props ? modal.props.hash : null;
    } else {
      // Otherwise, we look at our current params to get the hash
      const { urlParams, queryParams } = currentPage;
      const getPageParams = PostsFromSubreddit.pageParamsToSubredditPostsParams;
      const pageParams = getPageParams({ urlParams, queryParams });
      hash = paramsToPostsListsId(pageParams);
    }
    const postsList = hash && postsLists[hash];
    if (postsList && !postsList.loading) {
      // We have posts!  Look for thumbails, stripping out nsfw, stickied, etc.
      const uuids = postsList.results.map(item => item.uuid);
      const allThumbs = uuids
        .filter(item => !(over18 || posts[item].over18))
        .filter(item => !posts[item].stickied)
        .map(item => posts[item].thumbnail)
        .filter(item => !!item && item.startsWith('http'));
      if (allThumbs.length >= THUMBNAIL_THRESHOLD) {
        // We have enough, so pass up the array
        thumbnails = allThumbs.slice(0, THUMBNAIL_THRESHOLD);
      } else {
        // 'null' means we know we don't have enough
        // 'undefined' (before we have posts) means we don't know yet
        thumbnails = null;
      }
    }

    return {
      urls,
      features,
      device,
      thumbnails,
    };
  },
);
