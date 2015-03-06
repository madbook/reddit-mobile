import React from 'react';
import q from 'q';
import querystring from 'querystring';

import LoadingFactory from '../components/Loading';
var Loading;

import ListingFactory from '../components/Listing';
var Listing;

import TopNavFactory from '../components/TopNav';
var TopNav;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class IndexPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listings: props.listings,
    };
  }

  componentDidMount () {
    IndexPage.populateData(this.props.api, this.props, true).done((function(data) {

      this.setState({
        listings: data.listings,
      });
    }).bind(this));

    this.props.app.emit(TopNav.SUBREDDIT_NAME, this.props.subredditName);
  }

  render () {
    var loading;

    if (this.state.listings === undefined) {
      loading = (
        <Loading />
      );
    }

    var firstId;
    var lastId;
    var prevButton;
    var nextButton;
    var hideSubredditLabel = this.props.subredditName;
    var page = this.props.page || 0;
    var session = this.props.session;
    var api = this.props.api;

    var listings = this.state.listings || [];

    var subreddit = '';

    if (this.props.subredditName) {
      subreddit = '/r/' + this.props.subredditName;
    }

    var sort = this.props.sort || 'hot';

    if (listings.length) {
      firstId = listings[0].name;
      lastId = listings[listings.length - 1].name;

      if (page > 0) {
        var prevQuery = Object.assign({}, this.props.query, {
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

      var nextQuery = Object.assign({}, this.props.query, {
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

    return (
      <main>
        { loading }
        <TopSubnav sort={ sort } list='comments' baseUrl={ this.props.url }/>
        <div className='container listing-container'>
          {
            listings.map(function(listing, i) {
              var index = (page * 25) + i;

              if (!listing.hidden) {
                return (
                  <Listing listing={listing} index={index} key={'page-listing-' + index} page={ page } hideSubredditLabel={ hideSubredditLabel } session={ session } api={api} />
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
      </main>
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    var auth;

    if (props && props.session && props.session.token) {
      auth = props.session.token.access_token;
    }

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve();
      return defer.promise;
    }

    var options = api.buildOptions(auth);

    if (props.after) {
      options.query.after = props.after;
    }

    if (props.before) {
      options.query.before = props.before;
    }

    if (props.subredditName) {
      options.query.subredditName = props.subredditName;
    }

    if (props.sort) {
      options.query.sort = props.sort;
    }

    // Initialized with data already.
    if (typeof props.listings !== 'undefined') {
      api.hydrate('links', options, props.listings);

      defer.resolve(props);
      return defer.promise;
    }

    api.links.get(options).then(function(data) {
      defer.resolve({
        listings: data,
      });
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

function IndexPageFactory(app) {
  Listing = ListingFactory(app);
  Loading = LoadingFactory(app);
  TopNav = TopNavFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/index', IndexPage);
}

export default IndexPageFactory;
