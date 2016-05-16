import React from 'react';
import { UrlSwitch, Case } from '@r/platform/url';
import TopNav from 'app/components/TopNav';

export const AppTopNav = () => (
  <UrlSwitch>
    <Case url='/login' exec={ () => null } />
    <Case url='*' exec={ () => <TopNav /> } />
  </UrlSwitch>
);
