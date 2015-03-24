import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import UserProfileNavFactory from '../components/UserProfileNav';
var UserProfileNav;

class UserGildPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userProfile: props.userProfile,
    };
  }

  componentDidMount() {
    UserGildPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        userProfile: data.userProfile,
      });
    }).bind(this));

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, this.props.userName);
  }

  render() {
    var loading;

    if (this.state.userProfile === undefined) {
      loading = (
        <Loading />
      );
    }

    var api = this.props.api;
    var token = this.props.token;
    var user = this.props.user || {};

    var userProfile = this.state.userProfile || {};
    var name = this.props.userName;

    return (
      <main>
        { loading }
        <UserProfileNav userName={ name } gildActive={ true } />
        <div className='container'>
          <div className='well well-lg'>
            <p>Sorry, this isn't ready yet!</p>
          </div>
        </div>
      </main>
    );
  }

  static populateData(api, props, synchronous) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve();
      return defer.promise;
    }

    var options = api.buildOptions(props.token);

    if (props.userName) {
      options.user = props.userName;
    } else {
      defer.reject('No user name passed in');
    }

    // Initialized with data already.
    if (typeof props.userProfile !== 'undefined') {
      api.hydrate('users', options, props.userProfile);

      defer.resolve(props);
      return defer.promise;
    }

    api.users.get(options).then(function(data) {
      defer.resolve({
        userProfile: data,
      });
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

function UserGildPageFactory(app) {
  UserProfileNav = UserProfileNavFactory(app);
  Loading = LoadingFactory(app);

  return app.mutate('core/pages/userGild', UserGildPage);
}

export default UserGildPageFactory;
