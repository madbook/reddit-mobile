import React from 'react';
import { UrlSwitch, Case } from '@r/platform/url';

import TopNav from 'app/components/TopNav';
import PostSubmitModal from 'app/components/PostSubmitModal';
import PostSubmitCommunityModal from 'app/components/PostSubmitCommunityModal';

export const AppTopNav = () => (
  <UrlSwitch>
    <Case url='/login' exec={ () => null } />
    <Case url='/register' exec={ () => null } />
    <Case url='/r/:subredditName/submit' exec={ () => <PostSubmitModal /> } />
    <Case url='/submit' exec={ () => <PostSubmitModal /> } />
    <Case url='/submit/to_community' exec={ () => <PostSubmitCommunityModal /> } />
    <Case url='*' exec={ () => <TopNav /> } />
  </UrlSwitch>
);
