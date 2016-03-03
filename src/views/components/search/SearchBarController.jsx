import React from 'react';
import querystring from 'querystring';
import SearchBar from './SearchBar';
import constants from '../../../constants';

const T = React.PropTypes;

const SEARCH_MIN_LENGTH = 3;

export default class SearchBarController extends React.Component {
  static propTypes = {
    app: T.object.isRequired,
    ctx: T.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showSearchBar: false,
    };

    this.toggleSearchBar = this.toggleSearchBar.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClearSearchForm = this.handleClearSearchForm.bind(this);
  }

  toggleSearchBar(e) {
    this.preventClose(e);

    this.setState({
      showSearchBar: !this.state.showSearchBar,
    });

    if (this.state.showSearchBar) { // going to close
      this.props.app.emit(constants.OVERLAY_MENU_OPEN, false);
      this.props.app.emit('searchBar', { type: 'search_cancelled' });
    } else { // going to open
      this.props.app.emit(constants.OVERLAY_MENU_OPEN, true);
      this.props.app.emit('searchBar', { type: 'search_opened' });
    }
  }

  preventClose(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleSearch(searchTerm) {
    if (searchTerm.length < SEARCH_MIN_LENGTH) { return; }

    // release the scroll blocker
    this.props.app.emit(constants.OVERLAY_MENU_OPEN, false);
    this.props.app.emit('searchBar', {
      type: 'search_executed',
      query_string: searchTerm,
      query_string_length: searchTerm.length,
    });

    this.props.app.redirect(this.composeUrl({
      ...this.props,
      query: searchTerm.slice(0, 512),
      subredditName: this.props.ctx.params.subreddit,
      type: 'sr,link',
    }));
  }

  handleClearSearchForm() {
    this.props.app.emit('searchBar', { type: 'search_form_cleared' });
  }

  composeUrl(data) {
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

  render() {
    const { showSearchBar } = this.state;

    return (
      <div className='SearchBarController'>
        <div
          className='SearchBarController__icon icon-search icon-large'
          onClick={ this.toggleSearchBar }
        />
        { showSearchBar ? this.renderSearchBar() : null }
      </div>
    );
  }

  renderSearchBar() {
    const { ctx } = this.props;

    return (
      <div className='SearchBarController__overlay' onClick={ this.toggleSearchBar }>
        <div className='SearchBarController__searchArea'>
          <div className='SearchBarController__close icon-nav-arrowback'/>
          <div className='SearchBarController__barContainer' onClick={ this.preventClose }>
            <SearchBar
              formUrl={ this.composeUrl({ subredditName: ctx.params.subreddit }) }
              initialValue={ ctx.query.q }
              onSubmit={ this.handleSearch }
              onClear={ this.handleClearSearchForm }
            />
          </div>
        </div>
      </div>
    );
  }
}
