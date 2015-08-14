import React from 'react';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import constants from '../../constants';

import BasePage from '../pages/BasePage';

class BodyLayout extends BasePage {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.props.app.emit(constants.TOP_NAV_CHANGE,
                        this.props.topNavTitle,
                        this.props.topNavLink,
                        this.props.data.get('subreddit')
                       );
  }

  render () {
    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} user={ this.state.data.user || this.props.dataCache.user } />
        <TopNav {...this.props}/>
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
