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
    let { user, userSubscriptions } = this.state.data;
    let { globalMessage, app } = this.props;

    let info = [];
    if (globalMessage) {
      info.push(globalMessage);
    }

    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} user={ user} subscriptions={ userSubscriptions } />
        <TopNav {...this.props}/>
        <InfoBar info={ info } app={ app }/>
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
