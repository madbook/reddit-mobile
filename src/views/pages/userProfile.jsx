import React from 'react';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import UserProfile from '../components/UserProfile';

class UserProfilePage extends BasePage {
  static propTypes = {
    userName: React.PropTypes.string.isRequired,
  };
  
  get track () {
    return 'userProfile';
  }

  render() {
    if (!this.state.data || !this.state.data.userProfile) {
      return (
        <Loading />
      );
    }

    const userProfile = this.state.data.userProfile;
    const name = this.props.userName;

    return (
      <div className='user-page user-profile'>
        <TopSubnav
          app={ this.props.app }
          user={ this.state.data.user }
          hideSort={ true }
        />

        <UserProfile
          userProfile={ userProfile }
          key={ `user-profile-${name}` }
          user={ this.props.user }
          token={ this.props.token }
          app={ this.props.app }
        />
      </div>
    );
  }
}

export default UserProfilePage;
