import React from 'react';

import PostsList from '../components/PostsList/PostsList';

import PostsFromSubredditHandler from '../router/handlers/PostsFromSubredditHandler';
import { paramsToPostsListsId } from '../models/PostsListModel';


// props is pageData
export const PostsFromSubredditPage = (props) => {
  const postsListParams = PostsFromSubredditHandler.PageParamsToSubredditPostsParams(props);
  const postsListId = paramsToPostsListsId(postsListParams);

  return (
    <div className='PostsFromSubredditPage'>
      <div className='PostsFromSubredditPage__header'>
        { `Posts from r/${postsListParams.subredditName || 'frontpage'} `}
        <PostsList postsListId={ postsListId } />
      </div>
    </div>
  );
};
