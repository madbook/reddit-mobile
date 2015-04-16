import React from 'react';
import q from 'q';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import SearchBarFactory from '../components/SearchBar';
var SearchBar;

import ListingFactory from '../components/Listing';
var Listing;

const _searchMinLength = 3;
const _searchLimit = 25;

class SearchPage extends React.Component {
  constructor(props) {
    super(props);

    this._lastQueryKey = null;

    this.state = {
      results: props.results || {},
      subreddits: props.subreddits || {},
      loaded: props.results.data || props.subreddits.data
    };
  }

  _composeUrl(data) {
    return (data.subredditName ? `/r/${data.subredditName}` : '')
      + `/search?q=${data.query}`
      + (data.before ? `&before=${data.before}` : '')
      + (data.after ? `&after=${data.after}` : '')
      + (data.page ? `&page=${data.page}` : '');
  }

  _generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  _getPopularSubreddits(props) {
    var ctx = this;
    SearchPage.populatePopularSubreddits(props.api, props, true).done(function (data) {
      ctx.setState({
        results: {},
        subreddits: data || {},
        loaded: true
      });
    });
  }

  _performSearch(props) {
    var ctx = this;
    if (props.query) {
      let currentQueryKey = ctx._generateUniqueKey();
      ctx._lastQueryKey = currentQueryKey;
      SearchPage.populateData(props.api, props, true).done(function (data) {
        if (currentQueryKey === ctx._lastQueryKey) {
          if (SearchPage.isNoRecordsFound(data)) {
            ctx._getPopularSubreddits(props);
          } else {
            ctx.setState({
              results: data || {},
              subreddits: {},
              loaded: true
            });
          }
        }
      });
    } else {
      ctx._getPopularSubreddits(props);
    }
  }

  componentDidMount() {
    this._performSearch(this.props);
    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, '');
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      loaded: false
    });
    this._performSearch(nextProps);
  }

  handleShowMoreClick(e) {
    var list = e.currentTarget.previousSibling;
    list.className = list.className.replace('list-short-view', '');
  }

  handleInputChanged(data) {
    var props = this.props;
    var value = data.value || '';
    if (value !== props.query && (!value || value.length >= _searchMinLength)) {
      var url = this._composeUrl({
        query: value,
        subredditName: props.subredditName
      });
      props.app.pushState(null, null, url);
      props.app.render(url, false);
    }
  }

  render() {
    var state = this.state;
    var props = this.props;
    var app = props.app;

    var controls;
    var tracking;

    if (!state.loaded) {
      controls = (
        <Loading />
      );
    } else {
      // to make life easier
      state.results.data = state.results.data || {};
      state.subreddits.data = state.subreddits.data || [];

      var subreddits = state.results.data.subreddits || [];
      var listings = state.results.data.links || [];
      var noResults = listings.length === 0;
      var subredditResultsOnly = !noResults && props.subredditName;

      var page = props.page || 0;
      var meta = state.results.data.meta || {};

      // API is messed up, so we have to do our own detection for the prev..
      var prevUrl = (meta.before || listings.length && page > 0) ? this._composeUrl({
        query: props.query,
        subredditName: props.subredditName,
        before: meta.before || listings[0].name,
        page: page - 1
      }) : null;

      // ..and of course for the next too :-\
      var nextUrl = (meta.after || (props.before && listings.length)) ? this._composeUrl({
        query: props.query,
        subredditName: props.subredditName,
        after: meta.after || listings[listings.length - 1].name,
        page: page + 1
      }) : null;

      controls = [
        <div className={ `container no-results text-right text-special ${noResults && props.query ? '' : 'hidden'}` } key="search-no-results">
          Sorry, we couldn't find anything.
        </div>,

        <div className={ `container subreddit-only text-left ${subredditResultsOnly ? '' : 'hidden'}` } key="search-subreddit-only">
          <span>{ `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }</span>
          <a href={ this._composeUrl({ query: props.query }) }>Search all of reddit?</a>
        </div>,

        <div className={ `container subreddits-container ${noResults ? '' : 'hidden'}` }
             ref="subreddits" key="popular-subreddits">
          <h4 className="text-center">Trending subreddits</h4>
          <ul className="subreddits-list">
            {
              state.subreddits.data.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `popular-subreddit-${idx}` }>
                    <a href={subreddit.url} title={subreddit.title}>
                      <img src={subreddit.header_img} alt="Subreddit logo" />
                      <span>{subreddit.title}</span>
                    </a>
                  </li>
                );
              })
            }
          </ul>
        </div>,

        <div className={ `container summary-container ${noResults || subredditResultsOnly ? 'hidden' : ''}` }
             ref='summary' key="search-summary">
          <h4 className="text-center">Subreddits</h4>
          <ul className="subreddits-list list-short-view">
            {
              subreddits.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `search-subreddit-${idx}` }>
                    <a href={subreddit.url} title={subreddit.name}>
                      <span>{subreddit.name} <strong>({subreddit.count})</strong></span>
                    </a>
                  </li>
                );
              })
            }
          </ul>
          <button className={ `btn-show-more btn-link pull-right ${subreddits.length > 3 ? '' : 'hidden'}` }
                  title="Show more" onClick={this.handleShowMoreClick.bind(this)}>Show more</button>
        </div>,

        <div className={ `container listings-container ${noResults ? 'hidden' : ''}` }
             ref="listings" key="search-listings">
          <h4 className="text-center">Posts</h4>
          {
            listings.map(function (listing, idx) {
              if (!listing.hidden) {
                return (
                  <Listing
                    app={ app }
                    listing={ listing }
                    index={ idx }
                    key={ `search-listing-${idx}` }
                    user={ props.user }
                    token={ props.token }
                    api={ props.api }
                  />
                );
              }
            })
          }
          <div className="row pageNav">
            <div className="col-xs-12">
              <p>
                {
                <a href={ prevUrl } className={ `btn btn-sm btn-primary ${prevUrl ? '' : 'hidden'}` } rel="prev">
                  <span className='glyphicon glyphicon-chevron-left'></span>
                  Previous Page
                </a>
                } {
                <a href={ nextUrl } className={ `btn btn-sm btn-primary ${nextUrl ? '' : 'hidden'}` } rel="next">
                  Next Page
                  <span className='glyphicon glyphicon-chevron-right'></span>
                </a>
                }
              </p>
            </div>
          </div>
        </div>
      ];
    }

    if (state.results.meta && this.props.renderTracking) {
      tracking = (<TrackingPixel url={ state.results.meta.tracking } user={ this.props.user } loid={ this.props.loid } loidcreated={ this.props.loidcreated } />);
    }

    return (
      <main className='search-main'>
        <div className="container search-bar-container">
          <SearchBar {...this.props} inputChangedCallback={ this.handleInputChanged.bind(this) } />
        </div>

        { controls }

        { tracking }
      </main>
    );
  }

  static isNoRecordsFound(data) {
    return (((data || {}).data || {}).links || []).length === 0;
  }

  static populateData(api, props, synchronous, useCache = true) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve({});
      return defer.promise;
    }

    var options = api.buildOptions(props.token);
    options.query.q = props.query;
    options.query.limit = _searchLimit;
    options.query.before = props.before;
    options.query.after = props.after;
    options.query.subreddit = props.subredditName;
    options.query.include_facets = 'on';
    options.useCache = useCache;

    // Initialized with data already.
    if (useCache && (props.results || {}).data) {
      api.hydrate('search', options, props.results);

      defer.resolve(props.results);
      return defer.promise;
    }

    api.search.get(options).done(function (data) {
      data = data || {};
      defer.resolve(data);
    });

    return defer.promise;
  }

  static populatePopularSubreddits(api, props, synchronous, useCache = true) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve({});
      return defer.promise;
    }

    var options = api.buildOptions(props.token);
    options.query.sort = 'popular';
    options.useCache = useCache;

    // Initialized with data already.
    if (useCache && ((props.subreddits || {}).data || []).length) {
      api.hydrate('subreddits', options, props.subreddits);

      defer.resolve(props.subreddits);
      return defer.promise;
    }

    api.subreddits.get(options).done(function (data) {
      defer.resolve(data);
    });

    return defer.promise;
  }
}

function SearchPageFactory(app) {
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  SearchBar = SearchBarFactory(app);
  Listing = ListingFactory(app);

  return app.mutate('core/pages/search', SearchPage);
}

export default SearchPageFactory;

