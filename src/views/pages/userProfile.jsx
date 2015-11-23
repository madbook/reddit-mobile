import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import UserProfile from '../components/UserProfile';

class UserProfilePage extends BasePage {
  get track () {
    return 'userProfile';
  }

  render() {
    if (!this.state.data || !this.state.data.userProfile) {
      return (
        <Loading />
      );
    }

    var userProfile = this.state.data.userProfile;
    var name = this.props.userName;

    return (
      <div className="user-page user-profile">
        <TopSubnav
          app={ this.props.app }
          user={ this.state.data.user }
          hideSort={ true }
        />

        <UserProfile
          userProfile={userProfile}
          key={'user-profile-' + name}
          user={this.props.user}
          token={this.props.token}
          app={ this.props.app }
        />
      </div>
    );
  }
}

UserProfilePage.propTypes = {
  userName: React.PropTypes.string.isRequired,
}

export default UserProfilePage;
