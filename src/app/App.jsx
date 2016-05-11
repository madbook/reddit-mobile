import './App.less';
import React from 'react';

import { UrlSync } from '@r/platform/components';
import { AppMainPage } from './pages/AppMainPage';
import { CookieSync } from './CookieSync';
import { LocalStorageSync } from './LocalStorageSync';
import { DomModifier } from './DomModifier';
import { AppTopNav } from './components/AppTopNav/AppTopNav';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <AppTopNav />
        <AppMainPage />
        <UrlSync />
        <CookieSync />
        <LocalStorageSync />
        <DomModifier />
      </div>
    );
  }
}
