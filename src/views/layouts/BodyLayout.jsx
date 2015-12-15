import React from 'react';

import constants from '../../constants';

import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import BasePage from '../pages/BasePage';
import InfoBar from '../components/InfoBar';

class BodyLayout extends BasePage {
  constructor(props) {
    super(props);
  }

  render () {
    const { user, userSubscriptions } = this.state.data;
    const { app, globalMessage, showEUCookieMessage } = this.props;

    let messages = [];
    if (showEUCookieMessage) {
      messages.push({type: constants.messageTypes.EU_COOKIE});
    }

    if (globalMessage) {
      messages.push(globalMessage);
    }

    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} user={ user } subscriptions={ userSubscriptions } />
        <TopNav {...this.props}/>
        <InfoBar messages={ messages } app={ app } showEUCookieMessage={ showEUCookieMessage }/>
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
