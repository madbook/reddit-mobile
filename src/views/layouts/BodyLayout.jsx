import React from 'react';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import constants from '../../constants';

import BaseComponent from '../components/BaseComponent';

class BodyLayout extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} />
        <TopNav {...this.props}/>
        <main>
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
