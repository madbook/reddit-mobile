import './styles.less';
import React from 'react';

import { UrlSync } from '@r/platform/components';
import { TooltipShutter } from '@r/widgets/tooltip';

import { AppMainPage } from './pages/AppMain';
import AppOverlayMenu from './components/AppOverlayMenu';
import { AppTopNav } from './components/AppTopNav';
import DropdownCover from './components/DropdownCover';
import { CookieSync } from './side-effect-components/CookieSync';
import { DomModifier } from './side-effect-components/DomModifier';
import { LocalStorageSync } from './side-effect-components/LocalStorageSync';
import { SessionRefresher } from './side-effect-components/SessionRefresher';

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
        <SessionRefresher />
        <TooltipShutter />
        <DropdownCover />
      </div>
    );
  }
}
