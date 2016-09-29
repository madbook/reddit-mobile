import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import CommunityHeader from 'app/components/CommunityHeader';
import Loading from 'app/components/Loading';
import PostsList from 'app/components/PostsList';
import NSFWInterstitial from 'app/components/NSFWInterstitial';
import SortAndTimeSelector from 'app/components/SortAndTimeSelector';
import SubNav from 'app/components/SubNav';

import PostsFromSubredditHandler from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';

import isFakeSubreddit from 'lib/isFakeSubreddit';

const mapStateToProps = createSelector(
  (_, props) => props, // props is the page props splatted.
  state => state.postsLists,
  state => state.subreddits,
  state => state.preferences,
  state => state.modal.id,
  (pageProps, postsLists, subreddits, preferences, modalId) => {
    const postsListParams = PostsFromSubredditHandler.pageParamsToSubredditPostsParams(pageProps);
    const postsListId = paramsToPostsListsId(postsListParams);
    const { subredditName } = postsListParams;

    return {
      postsListId,
      preferences,
      subredditName,
      modalId,
      postsList: postsLists[postsListId],
      subreddit: subreddits[subredditName],
    };
  },
);

// props is pageData
export const PostsFromSubredditPage = connect(mapStateToProps)(props => {
  const {
    postsListId,
    postsList,
    subredditName,
    subreddit,
    preferences,
  } = props;

  const showSubnav = !!postsList && !postsList.loading;
  const forFakeSubreddit = isFakeSubreddit(subredditName);
  const subnavLink = forFakeSubreddit ? null : {
    href: `/r/${subredditName}/about`,
    text: 'About this community',
  };

  const className = 'PostsFromSubredditPage BelowTopNav';

  // If this subreddit is over18, then we need to show the NSFWInterstitial
  // before the user sees the actual content.
  // So if we haven't confirmed the users is over 18, wait until
  // the subreddit is loaded to check if we need to show the NSFWInterstitial.
  // We don't need to do this check for fakeSubreddits because individual posts
  // do their own NSFW bluring.
  if (!preferences.over18 && !forFakeSubreddit) {
    if (!subreddit) {
      // Show loading until we know the subreddit is over 18 or not
      return (
        <div className={ className }>
          <Loading />
        </div>
      );
    }

    if (subreddit.over18) {
      return (
        <div className={ className } >
          <NSFWInterstitial />
        </div>
      );
    }
  }

  return (
    <div className={ className }>
      { !forFakeSubreddit ? <CommunityHeader subredditName={ subredditName } /> : null }
      { showSubnav ? renderSubNav(subnavLink) : null }

      <PostsList
        postsListId={ postsListId }
        subredditIsNSFW={ !!subreddit && subreddit.over18 }
      />
    </div>
  );
});

function renderSubNav(subnavLink) {
  return (
    <SubNav rightLink={ subnavLink } showWithoutUser={ true }>
      <SortAndTimeSelector />
    </SubNav>
  );
}
