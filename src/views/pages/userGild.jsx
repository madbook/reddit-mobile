import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import q from 'q';
import querystring from 'querystring';

import BaseComponent from '../components/BaseComponent';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import TrackingPixel from '../components/TrackingPixel';

class UserGildPage extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    UserGildPage.populateData(globals().api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'u/' + this.props.userName);
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  render() {
    var loading;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    }

    var api = globals().api;
    var app = globals().app;
    var user = this.props.user || {};

    //var userProfile = this.state.data.data || {};
    //var name = this.props.userName;
    var tracking;

    if (this.state.data.meta) {
      tracking = (
        <TrackingPixel
          referrer={ this.props.referrer }
          url={ this.state.data.meta.tracking }
          user={ this.props.user }
          experiments={ this.props.experiments }
        />);
    }

    return (
      <div className="user-page user-gild">
        <TopSubnav
          user={ user }
          hideSort={ true }
        />

        { loading }

        <div className='container'>
          <div className='well well-lg'>
            <p>Sorry, this isn’t ready yet!</p>
          </div>
        </div>

        { tracking }
      </div>
    );
  }

  static populateData(api, props, synchronous) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve(props.data);
      return defer.promise;
    }

    var options = api.buildOptions(props.apiOptions);

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

export default UserGildPage;
