import React from 'react';
import q from 'q';
import querystring from 'querystring';

import constants from '../../constants';
import globals from '../../globals';

import Loading from '../components/Loading';
import TrackingPixel from '../components/TrackingPixel';
import SearchBar from '../components/SearchBar';
import SearchSortSubnav from '../components/SearchSortSubnav';
import ListingList from '../components/ListingList';
import BaseComponent from '../components/BaseComponent';

const _searchMinLength = 3;
const _searchLimit = 25;


class SearchPage extends BaseComponent {
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

  _onSubmitSearchForm(e) {
    // Let the input change handle submission
    e.preventDefault();
  }

  _composeUrl(data) {
    var qs = { q: data.query };
    if (data.after) { qs.after = data.after; }
    if (data.before) { qs.before = data.before; }
    if (data.page) { qs.page = data.page; }
    if (data.sort) { qs.sort = data.sort; }
    if (data.time) { qs.time = data.time; }
    if (data.type) { qs.type = data.type; }

    return (data.subredditName ? `/r/${data.subredditName}` : '') +
      '/search?' + querystring.stringify(qs);
  }

  _composeSortingUrl(data) {
    var props = this.props;
    var qs = { q: props.query.q };
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
    if (props.query && props.query.q) {
      let currentQueryKey = ctx._generateUniqueKey();
      ctx._lastQueryKey = currentQueryKey;
      SearchPage.populateData(globals().api, props, true).done(function (data) {
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
    globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, '');
  }

  componentDidUpdate() {
    globals().app.emit('page:update', this.props);
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
    var props = this.props;

    var url = this._composeUrl({
      query: props.query.q,
      type: 'sr',
    });

    globals().app.redirect(url);
  }

  handleInputChanged(data) {
    var props = this.props;
    var value = data.value || '';

    if (value !== props.query.q && (value || value.length >= _searchMinLength)) {
      var url = this._composeUrl({
        query: value,
        subredditName: props.subredditName
      });

      globals().app.redirect(url);
    }
  }

  render() {
    var state = this.state;
    var props = this.props;

    var app = globals().app;
    var apiOptions = props.apiOptions;
    var compact = state.compact;

    var controls;
    var tracking;

    if (!state.loaded && props.query && props.query.q) {
      controls = (
        <Loading />
      );
    } else {
      // to make life easier
      state.data.data = state.data.data || {};

      var subreddits = state.data.data.subreddits || [];
      var listings = state.data.data.links || [];
      var noListResults = listings.length === 0;
      var noSubResults = subreddits.length === 0;
      var noResult = noSubResults && noListResults;
      var subredditResultsOnly = props.subredditName && props.query.q;

      var page = props.page || 0;
      var meta = state.data.data.meta || {};

      // API is messed up, so we have to do our own detection for the prev..
      var prevUrl = (meta.before || listings.length && page > 0) ? this._composeUrl({
        query: props.query.q,
        subredditName: props.subredditName,
        before: meta.before || listings[0].name,
        page: page - 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      // ..and of course for the next too :-\
      var nextUrl = (meta.after || (props.before && listings.length)) ? this._composeUrl({
        query: props.query.q,
        subredditName: props.subredditName,
        after: meta.after || listings[listings.length - 1].name,
        page: page + 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      controls = [
        <div className={ `container no-results text-right text-special ${noResult &&props.query.q ? '' : 'hidden'}` } key="search-no-results">
          Sorry, we couldn't find anything.
        </div>,

        <div className={ `container subreddit-only text-left ${subredditResultsOnly ? '' : 'hidden'}` } key="search-subreddit-only">
          <span>{ `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }</span>
          <a href={ this._composeUrl({ query: props.query.q }) }>Search all of reddit?</a>
        </div>,

        <div className={ `container summary-container ${noSubResults || (!noListResults && subredditResultsOnly) ? 'hidden' : ''}` }
             ref='summary' key="search-summary">
          <h4 className="text-center">Subreddits</h4>
          <ul className="subreddits-list">
            {
              subreddits.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `search-subreddit-${idx}` }>
                    <a href={subreddit.url} title={subreddit.display_name} className="subreddit-link">
                      <span className="subreddit-name">{subreddit.display_name} </span>
                    </a>
                  </li>
                );
              })
            }
          </ul>

          <button className={ `btn-show-more btn-link pull-right ${subreddits.length > 3 ? 'hidden' : ''}` }
                  title="Show more" onClick={this.handleShowMoreClick.bind(this)}>Show more</button>
        </div>,

        <div className={ `container listings-container ${noListResults ? 'hidden' : ''}` }
             ref="listings" key="search-listings">

          <h4 className="text-center">Posts</h4>

          <SearchSortSubnav
            sort={ props.sort }
            time={ props.time }
            composeSortingUrl={ this._composeSortingUrl.bind(this) }
          />
          <ListingList
            listings={ listings}
            https={ props.https }
            httpsProxy={ props.httpsProxy }
            apiOptions={ apiOptions }
            user={ props.user }
            token={ props.token }
            compact={ compact }
          />
          <div className="row pageNav">
            <div className="col-xs-12">
              <p>
                <a href={ prevUrl } className={ `btn btn-sm btn-primary ${prevUrl ? '' : 'hidden'}` } rel="prev">
                  <span className='glyphicon glyphicon-chevron-left'></span>
                  Previous Page
                </a>
                <a href={ nextUrl } className={ `btn btn-sm btn-primary ${nextUrl ? '' : 'hidden'}` } rel="next">
                  Next Page
                  <span className='glyphicon glyphicon-chevron-right'></span>
                </a>
              </p>
            </div>
          </div>
        </div>
      ];
    }

    if (state.data.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ state.data.meta.tracking }
          user={ this.props.user }
          loid={ this.props.loid }
          loidcreated={ this.props.loidcreated }
          compact={ this.props.compact }
          experiments={ this.props.experiments }
        />);
    }

    return (
      <div className='search-main'>
        <div className="container search-bar-container">
          <form action='/search' method='GET' ref='searchForm' onSubmit={ this._onSubmitSearchForm }>
            <div className='input-group vertical-spacing-top'>
              <SearchBar
                {...this.props}
                inputChangedCallback={ this.handleInputChanged.bind(this) }
              />
              <span className='input-group-btn'>
                <button className='btn btn-default' type='submit'>Search!</button>
              </span>
            </div>
          </form>
        </div>

        { controls }

        { tracking }
      </div>
    );
  }

  static isNoRecordsFound(data) {
    return (((data || {}).data || {}).links || []).length === 0 &&
           (((data || {}).data || {}).subreddits || []).length === 0
  }

  static populateData(api, props, synchronous, useCache = true) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve(props.data);
      return defer.promise;
    }

    if (!props.query.q) {
      return defer.resolve();
    }

    var options = api.buildOptions(props.apiOptions);

    options.query.q = props.query.q;
    options.query.limit = _searchLimit;
    options.query.before = props.before;
    options.query.after = props.after;
    options.query.subreddit = props.subredditName;
    options.query.sort = props.sort;
    options.query.t = props.time;
    options.query.include_facets = 'off';
    options.useCache = useCache;
    options.query.type = props.query.type || ['sr','link'];

    // Initialized with data already.
    if (useCache && (props.data || {}).data) {
      api.hydrate('search', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.search.get(options).then(function (data) {
      data = data || {};
      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }

}

export default SearchPage;
