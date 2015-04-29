import React from 'react';
import q from 'q';
import querystring from 'querystring';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import SearchBarFactory from '../components/SearchBar';
var SearchBar;

import SearchSortSubnavFactory from '../components/SearchSortSubnav';
var SearchSortSubnav;

import ListingFactory from '../components/Listing';
var Listing;

const _searchMinLength = 3;
const _searchLimit = 25;

class SearchPage extends React.Component {
  constructor(props) {
    super(props);

    this._lastQueryKey = null;

    this.state = {
      data: props.data || {},
      subreddits: props.subreddits || {},
      loaded: !!(props.data && props.data.data),
      compact: props.compact,
    };
  }

  _composeUrl(data) {
    var qs = { q: data.query };
    if (data.after) { qs.after = data.after; }
    if (data.before) { qs.before = data.before; }
    if (data.page) { qs.page = data.page; }
    if (data.sort) { qs.sort = data.sort; }
    if (data.time) { qs.time = data.time; }

    return (data.subredditName ? `/r/${data.subredditName}` : '') +
      '/search?' + querystring.stringify(qs);
  }

  _composeSortingUrl(data) {
    var props = this.props;
    var qs = { q: props.query };
    if (props.after) { qs.after = props.after; }
    if (props.before) { qs.before = props.before; }
    if (props.page) { qs.page = props.page; }

    if (data.isSort) {
      if (props.time) { qs.time = props.time; }
    } else if (data.isTime) {
      if (props.sort) { qs.sort = props.sort; }
    }

    return (props.subredditName ? `/r/${props.subredditName}` : '') +
      '/search?' + querystring.stringify(qs);
  }

  _generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  _performSearch(props) {
    var ctx = this;
    if (props.query) {
      let currentQueryKey = ctx._generateUniqueKey();
      ctx._lastQueryKey = currentQueryKey;
      SearchPage.populateData(props.api, props, true).done(function (data) {
        if (currentQueryKey === ctx._lastQueryKey) {
          if (!SearchPage.isNoRecordsFound(data)) {
            ctx.setState({
              data: data || {},
              subreddits: {},
              loaded: true
            });
          }
        }
      });
    }
  }

  componentDidMount() {
    //this._performSearch(this.props);
    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, '');
  }

  componentDidUpdate() {
    this.props.app.emit('page:update', this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query) {
      this.setState({
        loaded: false
      });
    }

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
    var apiOptions = props.apiOptions;
    var compact = state.compact;

    var controls;
    var tracking;

    if (!state.loaded) {
      controls = (
        <Loading />
      );
    } else {
      // to make life easier
      state.data.data = state.data.data || {};

      var subreddits = state.data.data.subreddits || [];
      var listings = state.data.data.links || [];
      var noResults = listings.length === 0;
      var subredditResultsOnly = props.subredditName && props.query;

      var page = props.page || 0;
      var meta = state.data.data.meta || {};

      // API is messed up, so we have to do our own detection for the prev..
      var prevUrl = (meta.before || listings.length && page > 0) ? this._composeUrl({
        query: props.query,
        subredditName: props.subredditName,
        before: meta.before || listings[0].name,
        page: page - 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      // ..and of course for the next too :-\
      var nextUrl = (meta.after || (props.before && listings.length)) ? this._composeUrl({
        query: props.query,
        subredditName: props.subredditName,
        after: meta.after || listings[listings.length - 1].name,
        page: page + 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      controls = [
        <div className={ `container no-results text-right text-special ${noResults && props.query ? '' : 'hidden'}` } key="search-no-results">
          Sorry, we couldn't find anything.
        </div>,

        <div className={ `container subreddit-only text-left ${subredditResultsOnly ? '' : 'hidden'}` } key="search-subreddit-only">
          <span>{ `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }</span>
          <a href={ this._composeUrl({ query: props.query }) }>Search all of reddit?</a>
        </div>,

        <div className={ `container summary-container ${noResults || (!noResults && subredditResultsOnly) ? 'hidden' : ''}` }
             ref='summary' key="search-summary">
          <h4 className="text-center">Subreddits</h4>
          <ul className="subreddits-list list-short-view">
            {
              subreddits.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `search-subreddit-${idx}` }>
                    <a href={subreddit.url} title={subreddit.name} className="subreddit-link">
                      <span className="subreddit-name">{subreddit.name} <strong>({subreddit.count})</strong></span>
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

          <SearchSortSubnav
            app={ app }
            sort={ props.sort }
            time={ props.time }
            composeSortingUrl={ this._composeSortingUrl.bind(this) }
          />
          {
            listings.map(function (listing, idx) {
              if (!listing.hidden) {
                return (
                  <Listing
                    https={ props.https }
                    httpsProxy={ props.httpsProxy }
                    apiOptions={ apiOptions }
                    app={ app }
                    listing={ listing }
                    index={ idx }
                    key={ `search-listing-${idx}` }
                    user={ props.user }
                    token={ props.token }
                    api={ props.api }
                    compact={ compact }
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

    if (state.data.meta && this.props.renderTracking) {
      tracking = (
        <TrackingPixel
          url={ state.data.meta.tracking }
          user={ this.props.user }
          loid={ this.props.loid }
          loidcreated={ this.props.loidcreated }
          compact={ this.props.compact }
          />);
    }

    return (
      <div className='search-main'>
        <div className="container search-bar-container">
          <SearchBar
            {...this.props}
            inputChangedCallback={ this.handleInputChanged.bind(this) }
          />
        </div>

        { controls }

        { tracking }
      </div>
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
      defer.resolve(props.data);
      return defer.promise;
    }

    var options = api.buildOptions(props.apiOptions);

    options.query.q = props.query;
    options.query.limit = _searchLimit;
    options.query.before = props.before;
    options.query.after = props.after;
    options.query.subreddit = props.subredditName;
    options.query.sort = props.sort;
    options.query.t = props.time;
    options.query.include_facets = 'on';
    options.useCache = useCache;

    // Initialized with data already.
    if (useCache && (props.data || {}).data) {
      api.hydrate('search', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.search.get(options).done(function (data) {
      data = data || {};
      defer.resolve(data);
    });

    return defer.promise;
  }

}

function SearchPageFactory(app) {
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  SearchBar = SearchBarFactory(app);
  SearchSortSubnav = SearchSortSubnavFactory(app);
  Listing = ListingFactory(app);

  return app.mutate('core/pages/search', SearchPage);
}

export default SearchPageFactory;

