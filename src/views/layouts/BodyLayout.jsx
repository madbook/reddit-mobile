import React from 'react';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import constants from '../../constants';

import BasePage from '../pages/BasePage';

class BodyLayout extends BasePage {
  constructor(props) {
    super(props);
  }

  render () {
    let { user, userSubscriptions } = this.state.data;

    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} user={ user} subscriptions={ userSubscriptions } />
        <TopNav {...this.props}/>
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
