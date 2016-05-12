import React from 'react';

import { PageSelector, Page } from '@r/platform/page';

import { CommentsPage } from './Comments';
import { PostsFromSubredditPage } from './PostsFromSubreddit';

import Login from '../components/login/Login';

const renderCommentsPage = (pageProps) => {
  return (<CommentsPage { ...pageProps} />);
};

const renderLoginPage = () => (<Login />);

export const AppMainPage = () => (
  <PageSelector>
    <Page
      url='/'
      component={ PostsFromSubredditPage }
    />
    <Page
      url='/r/:subredditName'
      component={ PostsFromSubredditPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/comment/:commentId'
      component={ renderCommentsPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
      component={ renderCommentsPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle?'
      component={ renderCommentsPage }
    />
    <Page
      url='/comments/:postId/:postTitle?'
      component={ renderCommentsPage }
    />
    <Page
      url='/login'
      component={ renderLoginPage }
    />
  </PageSelector>
);
