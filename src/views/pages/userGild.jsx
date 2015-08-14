import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import TrackingPixel from '../components/TrackingPixel';

class UserGildPage extends BasePage {
  render() {
    return (
      <div className="user-page user-gild">
        <TopSubnav
          { ...this.props }
          user={ this.state.data.user }
          hideSort={ true }
        />

        <div className='container'>
          <div className='well well-lg'>
            <p>Sorry, this isn’t ready yet!</p>
          </div>
        </div>
      </div>
    );
  }
}

UserGildPage.propTypes = {
  userName: React.PropTypes.string.isRequired,
}

export default UserGildPage;
