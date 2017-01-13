import './styles.less';
import React from 'react';

import { UrlSync } from '@r/platform/components';
import { TooltipShutter } from '@r/widgets/tooltip';

import AdblockTester from './components/AdblockTester';
import AppMainPage from './pages/AppMain';
import AppOverlayMenu from './components/AppOverlayMenu';
import CookieSync from './side-effect-components/CookieSync';
import DomModifier from './side-effect-components/DomModifier';
import LocalStorageSync from './side-effect-components/LocalStorageSync';
import SessionRefresher from './side-effect-components/SessionRefresher';
import ScrollPositionSync from './side-effect-components/ScrollPositionSync';
import TrackingPixel from 'app/side-effect-components/TrackingPixel';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <AppMainPage />
        <AppOverlayMenu />
        <UrlSync />
        <ScrollPositionSync />
        <CookieSync />
        <LocalStorageSync />
        <DomModifier />
        <SessionRefresher />
        <TooltipShutter />
        <AdblockTester />
        <TrackingPixel />
      </div>
    );
  }
}
