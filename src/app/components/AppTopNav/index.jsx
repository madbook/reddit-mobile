import React from 'react';
import { PageSelector, Page } from '@r/platform/page';
import TopNav from '../TopNav';

const renderNothing = () => null;
const renderTopNav = () => (<TopNav />);

export const AppTopNav = () => (
  <PageSelector>
    <Page url='/login' component={ renderNothing } />
    <Page url='*' component={ renderTopNav } />
  </PageSelector>
);
