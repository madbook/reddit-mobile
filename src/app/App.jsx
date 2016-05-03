import './App.less';
import React from 'react';
import Login from './components/login/Login';
import { Anchor, UrlSync } from '@r/platform/components';
import { PageSelector, Page } from '@r/platform/page';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <PageSelector>
          <Page
            url='/'
            component={pageData => (
              <div>
                <div>
                  <span className='icon icon-gold' />
                  <span className='icon icon-comment' />
                  <span className='icon icon-upvote' />
                  <Anchor href='/r/cfb?foo=bar'>Go to r/cfb</Anchor>
                </div>
                <div>
                  <Anchor href='/login'>Login</Anchor>
                </div>
              </div>
            )}
          />
          <Page
            url='/r/:subredditName'
            component={pageData => (
              <div>
                <div>
                  { pageData.urlParams.subredditName }
                </div>
                <Anchor href='/'>Homepage</Anchor>
              </div>
            )}
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
