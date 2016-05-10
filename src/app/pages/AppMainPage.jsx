import React from 'react';

import { PageSelector, Page } from '@r/platform/page';

import { CommentsPage } from './CommentsPage';
import { PostsFromSubredditPage } from './PostsFromSubredditPage';

import Login from '../components/login/Login';

export const AppMainPage = (props) => (
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
      component={ (pageProps) => {
        return (<CommentsPage { ...pageProps } />);
        }
      }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
      component={ (pageProps) => {
        return (<CommentsPage { ...pageProps } />);
        }
      }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle?'
      component={ (pageProps) => {
        return (<CommentsPage { ...pageProps } />);
        }
      }
    />
    <Page
      url='/comments/:postId/:postTitle?'
      component={ (pageProps) => {
        return (<CommentsPage { ...pageProps } />);
        }
      }
    />
    <Page
      url='/login'
      component={pageData => (
        <Login/>
      )}
    />
  </PageSelector>
);
