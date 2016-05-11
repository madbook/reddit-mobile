import './App.less';
import React from 'react';

import { PageSelector, Page } from '@r/platform/page';

import { UrlSync } from '@r/platform/components';
import { AppMainPage } from './pages/AppMainPage';
import { CookieSync } from './CookieSync';
import { DomModifier } from './DomModifier';
import TopNav from './components/TopNav/TopNav';


const TopNavRenderer = () => (
  <PageSelector>
    <Page url='/login' component={ () => null } />
    <Page
      url='*'
      component={ () => (<TopNav />) }
    />
  </PageSelector>
);

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <TopNavRenderer />
        <AppMainPage />
        <UrlSync/>
        <CookieSync />
        <DomModifier />
      </div>
    );
  }
}
