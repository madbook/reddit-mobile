import React from 'react';

import BasePage from './BasePage';
import TopSubnav from '../components/TopSubnav';

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
};

export default UserGildPage;
