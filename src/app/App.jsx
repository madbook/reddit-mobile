import './App.less';
import React from 'react';
import Login from './components/login/Login';
import { Anchor, UrlSync } from '@r/platform/components';
import { PageSelector, Page } from '@r/platform/page';

import { CommentsPage } from './pages/CommentsPage';
import { PostsFromSubredditPage } from './pages/PostsFromSubredditPage';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
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
        <UrlSync/>
      </div>
    );
  }
}
