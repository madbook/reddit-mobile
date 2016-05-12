import React from 'react';

import PostsList from 'app/components/PostsList';

import PostsFromSubredditHandler from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';


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
