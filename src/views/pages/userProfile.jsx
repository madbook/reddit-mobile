import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import UserProfileFactory from '../components/UserProfile';
var UserProfile;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

class UserProfilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    UserProfilePage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, this.props.userName);
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  render() {
    var loading;
    var profile;

    var userProfile = this.state.data.data || {};
    var name = this.props.userName;
    var tracking;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    } else {
      profile = (
        <UserProfile
          userProfile={userProfile}
          key={'user-profile-' + name}
          user={this.props.user}
          token={this.props.token}
          api={this.props.api}
        />
      );
    }

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (<TrackingPixel url={ this.state.data.meta.tracking }  loid={ this.props.loid } loidcreated={ this.props.loidcreated } />);
    }

    return (
      <main>
        { loading }
        <div>
          { profile }
        </div>

        { tracking }
      </main>
    );
  }

  static populateData(api, props, synchronous) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve({});
      return defer.promise;
    }

    var options = api.buildOptions(props.token);

    if (props.userName) {
      options.user = props.userName;
    } else {
      defer.reject('No user name passed in');
    }

    // Initialized with data already.
    if (props.data && typeof props.data.data !== 'undefined') {
      api.hydrate('users', options, props.data);

      defer.resolve(props);
      return defer.promise;
    }

    api.users.get(options).then(function(data) {
      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

function UserProfilePageFactory(app) {
  UserProfile = UserProfileFactory(app);
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);

  return app.mutate('core/pages/userProfile', UserProfilePage);
}

export default UserProfilePageFactory;
