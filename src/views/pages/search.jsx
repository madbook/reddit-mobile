import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';
import SearchSortSubnav from '../components/SearchSortSubnav';
import SearchBar from '../components/SearchBar';

const _searchMinLength = 3;
const _searchLimit = 25;

class SearchPage extends BasePage {
  constructor(props) {
    super(props);

    if ((!this.state.data || !this.state.data.search) && props.ctx.query.q) {
      this.state.loaded = false;
      this._loadSearchResults();
    }

    this.state.compact = props.compact;

    this._lastQueryKey = null;
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
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
        subredditName: props.subredditName
      });

      this.props.app.redirect(url);
    }
  }

  _composeUrl(data) {
    let qs = { q: data.query };
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
    const props = this.props;
    let qs = { q: props.ctx.query.q };
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

  handleShowMoreClick(e) {
    const props = this.props;

    const url = this._composeUrl({
      query: props.ctx.query.q,
      type: 'sr',
    });

    this.props.app.redirect(url);
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  render() {
    const state = this.state;
    const props = this.props;
    const app = this.props.app;
    const apiOptions = props.apiOptions;
    let controls;
    let noResult;

    if (!state.loaded && props.ctx.query && props.ctx.query.q) {
      controls = (
        <Loading />
      );
    } else if (!this.state.data.search) {
      controls = (
        <div className={ `container no-results text-right text-special ${noResult &&props.ctx.query.q ? '' : 'hidden'}` } key="search-no-results">
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
      noResult = noSubResults && noListResults;
      const subredditResultsOnly = props.subredditName && props.ctx.query.q;
      const compact = this.state.compact;

      const page = props.page || 0;

      const meta = state.data.subreddits ? state.data.subreddits.meta : {};

      // API is messed up, so we have to do our own detection for the prev..
      const prevUrl = (meta.before || listings.length && page > 0) ? this._composeUrl({
        query: props.ctx.query.q,
        subredditName: props.subredditName,
        before: meta.before || listings[0].name,
        page: page - 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      // ..and of course for the next too :-\
      const nextUrl = (meta.after || (props.before && listings.length)) ? this._composeUrl({
        query: props.ctx.query.q,
        subredditName: props.subredditName,
        after: meta.after || listings[listings.length - 1].name,
        page: page + 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      controls = [

        <div className={ `container subreddit-only text-left ${subredditResultsOnly ? '' : 'hidden'}` } key="search-subreddit-only">
          <span>{ `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }</span>
          <a href={ this._composeUrl({ query: props.ctx.query.q }) }>Search all of reddit?</a>
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

        <div className={ `container listing-container ${compact ? 'compact' : ''} ${noListResults ? 'hidden' : ''}` }
             ref="listings" key="search-listings">

          <h4 className="text-center">Posts</h4>

          <SearchSortSubnav
            app={ app }
            sort={ props.sort }
            time={ props.time }
            composeSortingUrl={ this._composeSortingUrl.bind(this) }
          />
          <ListingList
            app={ app }
            listings={ listings}
            apiOptions={ apiOptions }
            user={ props.user }
            token={ props.token }
            winWidth={ props.ctx.winWidth }
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

    return (
      <div className='search-main'>
        <div className="container search-bar-container">
          <SearchBar action='/search'
            onSearch={ this.onSearch.bind(this) }
            defaultValue={ this.props.ctx.query.q } />
        </div>

        { controls }
      </div>
    );
  }

  static isNoRecordsFound(data) {
    return ((data || {}).links || []).length === 0 &&
           ((data || {}).subreddits || []).length === 0
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SearchPage.propTypes = {
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

export default SearchPage;
