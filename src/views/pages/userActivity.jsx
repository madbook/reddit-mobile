import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import ListingFactory from '../components/Listing';
var Listing;

import CommentPreviewFactory from '../components/CommentPreview';
var CommentPreview;

import UserActivitySubnavFactory from '../components/UserActivitySubnav';
var UserActivitySubnav;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

class UserActivityPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    UserActivityPage.populateData(this.props.api, this.props, true).done((function(data) {
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

    var page = this.props.page || 0;
    var api = this.props.api;
    var token = this.props.token;
    var user = this.props.user;

    var activities = this.state.data.data || [];

    var subreddit = '';

    var sort = this.props.sort || 'hot';

    var app = this.props.app;

    var userProfile = this.props.userProfile || {};
    var name = this.props.userName;

    var tracking;
    var loginPath = this.props.loginPath;

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (<TrackingPixel url={ this.state.data.meta.tracking } user={ this.props.user } loid={ this.props.loid } loidcreated={ this.props.loidcreated } />);
    }

    return (
      <main className="user-activity">
        { loading }
        <UserActivitySubnav app={ app } sort={ sort } name={ name } activity={ this.props.activity }/>

        <div className='container listing-container'>
          {
            activities.map(function(thing, i) {
              var index = (page * 25) + i;

              if (thing._type === 'Link') {
                return (
                  <Listing
                    app={app}
                    listing={thing}
                    index={index}
                    key={'page-listing-' + index}
                    page={page}
                    hideSubredditLabel={false}
                    user={user}
                    token={token}
                    api={api}
                    hideUser={ true }
                    loginPath={ loginPath }
                  />
                );
              } else if (thing._type === 'Comment') {
                return (
                  <CommentPreview
                    comment={thing}
                    key={'page-comment-' + index}
                    page={page}
                  />
                );
              }
            })
          }
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

function UserActivityPageFactory(app) {
  Listing = ListingFactory(app);
  Loading = LoadingFactory(app);
  UserActivitySubnav = UserActivitySubnavFactory(app);
  CommentPreview = CommentPreviewFactory(app);
  TrackingPixel = TrackingPixelFactory(app);

  return app.mutate('core/pages/userActivity', UserActivityPage);
}

export default UserActivityPageFactory;
