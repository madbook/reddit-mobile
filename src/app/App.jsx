import './App.less';
import React from 'react';

import { UrlSync } from '@r/platform/components';
import { AppMainPage } from './pages/AppMainPage';
import { CookieSync } from './CookieSync';
import { DomModifier } from './DomModifier';
import TopNav from './components/TopNav/TopNav';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <TopNav />
        <AppMainPage />
        <UrlSync/>
        <CookieSync />
        <DomModifier />
      </div>
    );
  }
}
