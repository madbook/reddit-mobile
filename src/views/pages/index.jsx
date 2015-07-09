import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import q from 'q';
import querystring from 'querystring';

import Loading from '../components/Loading';
import TrackingPixel from '../components/TrackingPixel';
import ListingList from '../components/ListingList';
import TopSubnav from '../components/TopSubnav';

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
      compact: props.compact,
    };

    this.state.loaded = this.state.data && this.state.data.data;
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    IndexPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });

    }).bind(this));

    globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, this.state.subredditName);
    globals().app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _onCompactToggle (state) {
    this.setState({
      compact: state,
    });
  }

  componentWillUnmount() {
    globals().app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
  }

  render() {
    var loading;
    var props = this.props;
    var data = this.state.data;

    var compact = this.state.compact;

    if (!this.state.loaded) {
      return (
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
    var app = globals().app;

    var firstId;
    var lastId;
    var prevButton;
    var nextButton;

    var tracking;

    var loginPath = props.loginPath;
    var apiOptions = props.apiOptions;

    var subreddit = '';

    if (props.subredditName) {
      subreddit = '/r/' + props.subredditName;
      loginPath += '/?' + querystring.stringify({
        originalUrl: props.url,
      });
    }

    if (props.multi) {
      subreddit = '/u/' + props.multiUser + '/m/' + props.multi;
    }

    var sort = props.sort || 'hot';
    var excludedSorts = [];

    if (!props.subredditName || props.multi) {
      excludedSorts.push('gilded');
    }

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
          <a href={subreddit + '?' + querystring.stringify(prevQuery) } className='btn btn-sm btn-primary IndexPage-button prev'>
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
        <a href={ subreddit + '?' + querystring.stringify(nextQuery) } className='btn btn-sm btn-primary IndexPage-button next'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    if (this.state.data.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ this.state.data.meta.tracking }
          user={ props.user }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
          compact={ compact }
          experiments={ props.experiments }
        />);
    }

    var showAds = !!props.adsPath;

    if (props.prefs && props.prefs.hide_ads === true) {
      showAds = false;
    }

    return (
      <div>
        { loading }

        <TopSubnav
          user={ user }
          sort={ sort }
          list='listings'
          excludedSorts={ excludedSorts }
          baseUrl={ props.url }
          loginPath={ loginPath }
          apiOptions={ apiOptions }
        />

        <div className={'container Listing-container' + (compact ? ' compact' : '')} ref='listings'>
          <ListingList
            showAds={ showAds }
            adsPath={ props.adsPath }
            listings={listings}
            firstPage={page}
            https={ props.https }
            httpsProxy={ props.httpsProxy }
            apiOptions={ apiOptions }
            page={ page }
            hideSubredditLabel={ hideSubredditLabel }
            user={user}
            token={token}
            api={api}
            loginPath={loginPath}
            compact={compact}
            subredditTitle={subreddit}
          />
          <div className='pageNav IndexPage-buttons-holder-holder'>
            <div className='col-xs-12 IndexPage-buttons-holder'>
              <p className={'IndexPage-buttons' + (compact ? ' compact' : '')}>
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
      defer.resolve(props.data);
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

export default IndexPage;
