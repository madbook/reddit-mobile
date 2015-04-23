import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import ListingFactory from '../components/Listing';
var Listing;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class IndexPage extends React.Component {
  constructor(props) {
    super(props);

    var subredditName;

    if (props.subredditName) {
      subredditName = 'r/' + props.subredditName;
    } else if (props.multi) {
      subredditName = 'm/' + props.multi;
    }

    this.state = {
      data: props.data || {},
      subredditName: subredditName,
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    IndexPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });

    }).bind(this));

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, this.state.subredditName);
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  render() {
    var loading;
    var props = this.props;
    var data = this.state.data;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    }

    var listings = data.data || [];

    var hideSubredditLabel = props.subredditName &&
                             props.subredditName.indexOf('+') === -1 &&
                             props.subredditName !== 'all';

    var page = props.page || 0;
    var api = props.api;
    var token = props.token;
    var user = props.user;
    var app = props.app;

    var firstId;
    var lastId;
    var prevButton;
    var nextButton;

    var tracking;

    var subreddit = '';

    if (props.subredditName) {
      subreddit = '/r/' + props.subredditName;
    }

    if (props.multi) {
      subreddit = '/u/' + props.multiUser + '/m/' + props.multi;
    }

    var sort = props.sort || 'hot';

    if (listings.length) {
      firstId = listings[0].name;
      lastId = listings[listings.length - 1].name;

      if (page > 0) {
        var prevQuery = Object.assign({}, props.query, {
          count: 25,
          page: page - 1,
          before: firstId,
        });

        prevButton = (
          <a href={subreddit + '?' + querystring.stringify(prevQuery) } className='btn btn-sm btn-primary'>
            <span className='glyphicon glyphicon-chevron-left'></span>
            Previous Page
          </a>
        );
      }

      var nextQuery = Object.assign({}, props.query, {
        count: 25,
        page: page + 1,
        after: lastId,
      });

      nextButton = (
        <a href={ subreddit + '?' + querystring.stringify(nextQuery) } className='btn btn-sm btn-primary'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    var loginPath = props.loginPath;
    var apiOptions = props.apiOptions;

    if (this.state.data.meta && props.renderTracking) {
      tracking = (<TrackingPixel url={ this.state.data.meta.tracking } user={ props.user } loid={ props.loid } loidcreated={ props.loidcreated } />);
    }

    return (
      <div>
        { loading }

        <TopSubnav
          app={ app }
          user={ user }
          sort={ sort }
          list='listings'
          baseUrl={ props.url }
          loginPath={ props.loginPath }
          apiOptions={ apiOptions }
        />

        <div className='container listing-container' ref='listings'>
          {
            listings.map(function(listing, i) {
              var index = (page * 25) + i;

              if (!listing.hidden) {
                return (
                  <Listing
                    https={ props.https }
                    httpsProxy={ props.httpsProxy }
                    apiOptions={ apiOptions }
                    app={app}
                    listing={listing}
                    index={index}
                    key={'page-listing-' + index}
                    page={ page }
                    hideSubredditLabel={ hideSubredditLabel }
                    user={user}
                    token={token}
                    api={api}
                    loginPath={loginPath}
                  />
                );
              }
            })
          }

          <div className='row pageNav'>
            <div className='col-xs-12'>
              <p>
                { prevButton } { nextButton }
              </p>
            </div>
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

    if (props.after) {
      options.query.after = props.after;
    }

    if (props.before) {
      options.query.before = props.before;
    }

    if (props.subredditName) {
      options.query.subredditName = props.subredditName;
    }

    if (props.multi) {
      options.query.multi = props.multi;
      options.query.multiUser = props.multiUser;
    }

    if (props.sort) {
      options.query.sort = props.sort;
    }

    // Initialized with data already.
    if (props.data && typeof props.data.data !== 'undefined') {
      api.hydrate('links', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.links.get(options).then(function(data) {
      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

function IndexPageFactory(app) {
  Listing = ListingFactory(app);
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/index', IndexPage);
}

export default IndexPageFactory;
