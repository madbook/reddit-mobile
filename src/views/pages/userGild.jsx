import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class UserGildPage extends React.Component {
  shouldComponentUpdate (nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(nextState) !== JSON.stringify(this.state)
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    UserGildPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'u/' + this.props.userName);
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  render() {
    var loading;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    }

    var api = this.props.api;
    var token = this.props.token;
    var app = this.props.app;
    var user = this.props.user || {};

    //var userProfile = this.state.data.data || {};
    //var name = this.props.userName;
    var tracking;

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (<TrackingPixel url={ this.state.data.meta.tracking } user={ this.props.user } loid={ this.props.loid } loidcreated={ this.props.loidcreated } />);
    }

    return (
      <div className="user-page user-gild">
        <TopSubnav app={ app } user={ user } hideSort={ true } baseUrl={ this.props.url } loginPath={ this.props.loginPath } />

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
      defer.resolve({});
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

function UserGildPageFactory(app) {
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/userGild', UserGildPage);
}

export default UserGildPageFactory;
