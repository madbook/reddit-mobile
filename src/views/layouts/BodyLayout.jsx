import React from 'react';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import BetaBanner from '../components/BetaBanner';
import constants from '../../constants';

class BodyLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} />
        <TopNav {...this.props}/>
        <main>
          <BetaBanner show={ this.props.showBetaBanner } app={ this.props.app } />
          { this.props.children }
        </main>
      </div>
    );
  }
}

export default BodyLayout;
