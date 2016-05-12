import './App.less';
import React from 'react';

import { AppMainPage } from './pages/AppMain';
import AppOverlayMenu from './components/AppOverlayMenu/AppOverlayMenu';
import { AppTopNav } from './components/AppTopNav/AppTopNav';
import { CookieSync } from './CookieSync';
import { DomModifier } from './DomModifier';
import { LocalStorageSync } from './LocalStorageSync';
import { UrlSync } from '@r/platform/components';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <AppTopNav />
        <AppOverlayMenu />
        <AppMainPage />
        <UrlSync />
        <CookieSync />
        <LocalStorageSync />
        <DomModifier />
      </div>
    );
  }
}
