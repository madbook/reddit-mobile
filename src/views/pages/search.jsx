import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import Loading from '../components/Loading';
import SearchSortSubnav from '../components/SearchSortSubnav';
import SearchBar from '../components/SearchBar';

const _searchMinLength = 3;
const _searchLimit = 25;
// API hardcodes removing 3 (when using the default limit of 25) listing
// results and turning those into recommended subreddits based on your search.
const _searchLimitWithRecommendations = _searchLimit - 3;

class SearchPage extends BasePage {
  static isNoRecordsFound(data) {
    return ((data || {}).links || []).length === 0 &&
           ((data || {}).subreddits || []).length === 0;
  }
  
  static propTypes = {
    after: React.PropTypes.string,
    // apiOptions: React.PropTypes.object,
    before: React.PropTypes.string,
    data: React.PropTypes.object,
    page: React.PropTypes.number.isRequired,
    sort: React.PropTypes.string.isRequired,
    subredditName: React.PropTypes.string,
    subreddits: React.PropTypes.object,
    time: React.PropTypes.string.isRequired,
  };
  
  constructor(props) {
    super(props);

    if ((!this.state.data || !this.state.data.search) && props.ctx.query.q) {
      this.state.loaded = false;
      this._loadSearchResults();
    }

    this.state.compact = props.compact;

    this._lastQueryKey = null;

    this.onSearch = this.onSearch.bind(this);
    this._composeSortingUrl = this._composeSortingUrl.bind(this);
    this.handleShowMoreClick = this.handleShowMoreClick.bind(this);
  }

  get track () {
    return 'search';
  }

  _loadSearchResults() {
    this.props.data.get('search').then(function(results) {
      const oldData = this.state.data;
      const oldMeta = this.state.meta;

      this.setState({
        data: Object.assign({}, oldData, {
          search: results.body,
        }),
        meta: Object.assign({}, oldMeta, {
          search: results.headers,
        }),
        loaded: true,
      });
    }.bind(this));
  }

  onSearch(value) {
    // Let the input change handle submission
    const props = this.props;

    if (value !== props.ctx.query.q && (value || value.length >= _searchMinLength)) {
      const url = this._composeUrl({
        query: value,
        subredditName: props.subredditName,
      });

      this.props.app.redirect(url);
    }
  }

  _composeUrl(data) {
    const qs = { q: data.query };
    if (data.after) { qs.after = data.after; }
    if (data.before) { qs.before = data.before; }
    if (data.page) { qs.page = data.page; }
    if (data.sort) { qs.sort = data.sort; }
    if (data.time) { qs.time = data.time; }
    if (data.type) { qs.type = data.type; }

    const sub = (data.subredditName ? `/r/${data.subredditName}` : '');
    return `${sub}/search?${querystring.stringify(qs)}`;
  }

  _composeSortingUrl(data) {
    const props = this.props;
    const qs = { q: props.ctx.query.q };
    if (props.after) { qs.after = props.after; }
    if (props.before) { qs.before = props.before; }
    if (props.page) { qs.page = props.page; }

    if (data.isSort) {
      if (props.time) { qs.time = props.time; }
    } else if (data.isTime) {
      if (props.sort) { qs.sort = props.sort; }
    }

    const sub = (props.subredditName ? `/r/${props.subredditName}` : '');
    return `${sub}/search?${querystring.stringify(qs)}`;
  }

  _generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  handleShowMoreClick() {
    const props = this.props;

    const url = this._composeUrl({
      query: props.ctx.query.q,
      type: 'sr',
    });

    this.props.app.redirect(url);
  }

  shouldShowNoResultsMessage(data) {
    if (!data.search) {
      return true;
    }

    const props = this.props;

    // If we're searching within a subreddit and have no results don't
    // render the banner. The generic case will handle linking to the
    // site-wide search
    const searchingInSubreddit = !!(props.subredditName && props.ctx.query.q);
    return !data.search.links ||
      (data.search.links.length === 0 && !searchingInSubreddit);
  }

  render() {
    const state = this.state;
    const data = state.data;
    const props = this.props;
    const app = this.props.app;
    const apiOptions = props.apiOptions;
    let controls;

    if (!state.loaded && props.ctx.query && props.ctx.query.q) {
      controls = (
        <Loading />
      );
    } else if (this.shouldShowNoResultsMessage(data)) {
      const noResClass = props.ctx.query.q ? '' : 'hidden';
      controls = (
        <div
          className={ `container no-results text-right text-special ${noResClass}` }
          key="search-no-results"
        >
          Sorry, we couldn't find anything.
        </div>
      );
    } else {
      // to make life easier
      const searchResults = this.state.data.search;

      const subreddits = searchResults.subreddits || [];
      const listings = searchResults.links || [];
      const noListResults = listings.length === 0;
      const noSubResults = subreddits.length === 0;
      const subredditResultsOnly = props.subredditName && props.ctx.query.q;
      const compact = this.state.compact;

      const page = props.page || 0;

      const meta = state.data.subreddits ? state.data.subreddits.meta : {};

      // API is messed up, so we have to do our own detection for the prev..
      let prevUrl;
      if (meta.before || listings.length && page > 0) {
        prevUrl = this._composeUrl({
          query: props.ctx.query.q,
          subredditName: props.subredditName,
          before: meta.before || listings[0].name,
          page: page - 1,
          sort: props.sort,
          time: props.time,
        });
      }

      // ..and of course for the next too :-\
      let nextUrl;
      if (meta.after || listings.length >= _searchLimitWithRecommendations) {
        nextUrl = this._composeUrl({
          query: props.ctx.query.q,
          subredditName: props.subredditName,
          after: meta.after || listings[listings.length - 1].name,
          page: page + 1,
          sort: props.sort,
          time: props.time,
        });
      }

      const subredditOnlyClass = subredditResultsOnly ? '' : 'hidden';
      const showMoreClass = subreddits.length > 3 ? 'hidden' : '';
      const noSubClass = noSubResults || (!noListResults && subredditResultsOnly) ? 'hidden' : '';

      controls = [

        <div
          className={ `container subreddit-only text-left ${subredditOnlyClass}` }
          key="search-subreddit-only"
        >
          <span>
            { `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }
          </span>
          <a href={ this._composeUrl({ query: props.ctx.query.q }) }>Search all of reddit?</a>
        </div>,

        <div
          className={ `container summary-container ${noSubClass}` }
          ref='summary' key="search-summary"
        >
          <h4 className="text-center">Subreddits</h4>
          <ul className="subreddits-list">
            {
              subreddits.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `search-subreddit-${idx}` }>
                    <a
                      href={ subreddit.url }
                      title={ subreddit.display_name }
                      className="subreddit-link"
                    >
                      <span className="subreddit-name">{ subreddit.display_name } </span>
                    </a>
                  </li>
                );
              })
            }
          </ul>

          <button
            className={ `btn-show-more btn-link pull-right ${showMoreClass}` }
            title="Show more"
            onClick={ this.handleShowMoreClick }
          >Show more</button>
        </div>,

        <div className='container'>
          <h4 className='text-center'>Posts</h4>
          <SearchSortSubnav
            app={ app }
            sort={ props.sort }
            time={ props.time }
            composeSortingUrl={ this._composeSortingUrl }
          />
        </div>,

        <ListingContainer
          app={ app }
          ctx={ props.ctx }
          listings={ listings }
          apiOptions={ apiOptions }
          user={ props.user }
          token={ props.token }
          winWidth={ props.ctx.winWidth }
          compact={ compact }
          prevUrl={ prevUrl }
          nextUrl={ nextUrl }
          pageSize={ 22 }
        />,
      ];
    }

    return (
      <div className='search-main'>
        <div className="container search-bar-container">
          <SearchBar action='/search'
            onSearch={ this.onSearch }
            defaultValue={ this.props.ctx.query.q }
          />
        </div>

        { controls }
      </div>
    );
  }
}

export default SearchPage;
