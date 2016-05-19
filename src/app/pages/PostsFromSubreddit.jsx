import React from 'react';

import CommunityHeader from 'app/components/CommunityHeader';
import PostsList from 'app/components/PostsList';

import PostsFromSubredditHandler from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';

import isFakeSubreddit from 'lib/isFakeSubreddit';

// props is pageData
export const PostsFromSubredditPage = (props) => {
  const postsListParams = PostsFromSubredditHandler.PageParamsToSubredditPostsParams(props);
  const postsListId = paramsToPostsListsId(postsListParams);
  const { subredditName } = postsListParams;

  return (
    <div className='PostsFromSubredditPage BelowTopNav'>
      <div className='PostsFromSubredditPage__header'>
        { isFakeSubreddit(subredditName)
          ? null
          : <CommunityHeader subredditName={ subredditName } />
        }
        <PostsList postsListId={ postsListId } />
      </div>
    </div>
  );
};
