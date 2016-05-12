import React from 'react';

import PostsList from '../components/PostsList/PostsList';

import PostsFromSubredditHandler from '../router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from '../models/PostsList';


// props is pageData
export const PostsFromSubredditPage = (props) => {
  const postsListParams = PostsFromSubredditHandler.PageParamsToSubredditPostsParams(props);
  const postsListId = paramsToPostsListsId(postsListParams);

  return (
    <div className='PostsFromSubredditPage BelowTopNav'>
      <div className='PostsFromSubredditPage__header'>
        { `Posts from r/${postsListParams.subredditName || 'frontpage'} ` }
        <PostsList postsListId={ postsListId } />
      </div>
    </div>
  );
};
