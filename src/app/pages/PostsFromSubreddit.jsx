import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import CommunityHeader from 'app/components/CommunityHeader';
import PostsList from 'app/components/PostsList';
import SubNav from 'app/components/SubNav';

import PostsFromSubredditHandler from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';

import isFakeSubreddit from 'lib/isFakeSubreddit';

const mapStateToProps = createSelector(
  (_, props) => props, // props is the page props splatted.
  state => state.postsLists,
  (pageProps, postsLists) => {
    const postsListParams = PostsFromSubredditHandler.PageParamsToSubredditPostsParams(pageProps);
    const postsListId = paramsToPostsListsId(postsListParams);
    const { subredditName } = postsListParams;
    return { postsListId, postsList: postsLists[postsListId], subredditName };
  },
);

// props is pageData
export const PostsFromSubredditPage = connect(mapStateToProps)(props => {
  const { postsListId, postsList, subredditName } = props;
  const renderSubnav = !!postsList && !postsList.loading;
  const forFakeSubreddit = isFakeSubreddit(subredditName);
  const subnavLink = forFakeSubreddit ? null : {
    href: `/r/${subredditName}/about`,
    text: 'About this community',
  };

  return (
    <div className='PostsFromSubredditPage BelowTopNav'>
      <div className='PostsFromSubredditPage__header'>
        { !forFakeSubreddit && <CommunityHeader subredditName={ subredditName } /> }
        { renderSubnav &&
          <SubNav
            rightLink= { subnavLink }
            showWithoutUser={ true }
          /> }
        <PostsList postsListId={ postsListId } />
      </div>
    </div>
  );
});
