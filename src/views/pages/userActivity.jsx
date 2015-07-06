import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import q from 'q';
import querystring from 'querystring';

import Loading from '../components/Loading';
import ListingList from '../components/ListingList';
import UserActivitySubnav from '../components/UserActivitySubnav';
import TrackingPixel from '../components/TrackingPixel';
import BaseComponent from '../components/BaseComponent';

class UserActivityPage extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
      compact: props.compact,
    };

    this.state.loaded = this.state.data && this.state.data.data;
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    UserActivityPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'u/' + this.props.userName);
    globals().app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  _onCompactToggle (state) {
    this.setState({
      compact: state,
    });
  }

  componentWillUnmount() {
    globals().app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  render() {
    var loading;
    var props = this.props;
    var state = this.state;

    if (!state.loaded) {
      loading = (
        <Loading />
      );
    }

    var page = props.page || 0;
    var api = props.api;
    var token = props.token;

    var app = globals().app;
    var user = props.user;

    var activities = state.data.data || [];

    var subreddit = '';

    var sort = props.sort || 'hot';

    var userProfile = props.userProfile || {};
    var name = props.userName;

    var tracking;
    var loginPath = props.loginPath;

    if (state.data.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ state.data.meta.tracking }
          user={ props.user }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
          compact={ this.props.compact }
          experiments={ this.props.experiments }
        />);
    }

    return (
      <div className="user-page user-activity">
        <UserActivitySubnav
          sort={ sort }
          name={ name }
          activity={ props.activity }
          user={ user }
          loginPath={ props.loginPath } />

        { loading }

        <div className={'container Listing-container'} >
          <ListingList
            listings={activities}
            firstPage={page}
            https={ props.https }
            httpsProxy={ props.httpsProxy }
            page={page}
            hideSubredditLabel={false}
            user={user}
            token={token}
            api={api}
            hideUser={ true }
            loginPath={ loginPath }
            apiOptions={ props.apiOptions }
          />
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
    options.activity = props.activity || 'comments';

    if (props.after) {
      options.query.after = props.after;
    }

    if (props.before) {
      options.query.before = props.before;
    }

    if (props.sort) {
      options.query.sort = props.sort;
    }

    options.user = props.userName;

    // Initialized with data already.
    if (props.data && typeof props.data.data !== 'undefined') {
      defer.resolve(props.data);
      return defer.promise;
    }

    api.activities.get(options).then(function(data) {
      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

export default UserActivityPage;
