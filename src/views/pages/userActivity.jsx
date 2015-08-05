import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import q from 'q';
import querystring from 'querystring';

import BaseComponent from '../components/BaseComponent';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';
import TrackingPixel from '../components/TrackingPixel';
import UserActivitySubnav from '../components/UserActivitySubnav';

class UserActivityPage extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    UserActivityPage.populateData(globals().api, this.props, true).done((function(data) {
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
    var props = this.props;
    var state = this.state;

    if (!state.loaded) {
      loading = (
        <Loading />
      );
    }

    var page = props.page || 0;
    var activities = state.data.data || [];
    var subreddit = '';
    var sort = props.sort || 'hot';
    var userProfile = props.userProfile || {};
    var name = props.userName;
    var tracking;

    if (state.data.meta) {
      tracking = (
        <TrackingPixel
          url={ state.data.meta.tracking }
        />);
    }

    return (
      <div className="user-page user-activity">
        <UserActivitySubnav
          sort={ sort }
          name={ name }
          activity={ props.activity }
        />

        { loading }

        <div className={'container Listing-container'} >
          <ListingList
            listings={activities}
            firstPage={page}
            page={page}
            hideSubredditLabel={false}
            hideUser={ true }
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

//TODO: someone more familiar with this component could eventually fill this out better
UserActivityPage.propTypes = {
  activity: React.PropTypes.string.isRequired,
  after: React.PropTypes.bool,
  // apiOptions: React.PropTypes.object,
  before: React.PropTypes.bool,
  data: React.PropTypes.object,
  page: React.PropTypes.number,
  sort: React.PropTypes.string,
  userName: React.PropTypes.string.isRequired,
  userProfile: React.PropTypes.object,
}

export default UserActivityPage;
