import React from 'react';
import querystring from 'querystring';
import isEmpty from 'lodash/lang/isEmpty';
import omit from 'lodash/object/omit';
import { models } from '@r/api-client';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import SortSelector from '../components/SortSelector';
import Listing from '../components/listings/Listing';
import CommunityRow from '../components/communities/CommunityRow';
import ListingPaginationButtons from '../components/listings/ListingPaginationButtons';
import constants from '../../constants';
import { SORTS } from '../../sortValues';

const T = React.PropTypes;

function extractSearchResults(data) {
  return {
    links: data.body.links,
    subreddits: data.body.subreddits,
    meta: data.body.meta,
  };
}

export default class SearchPage extends BasePage {
  static propTypes = {
    app: T.object.isRequired,
    ctx: T.object.isRequired,
    apiOptions: T.object.isRequired,
    page: T.number.isRequired,
    sort: T.string.isRequired,
    time: T.string.isRequired,
    query: T.string,
    token: T.string,
    after: T.string,
    before: T.string,
    data: T.object,
    subredditName: T.string,
    subreddits: T.object,
  };

  get track() {
    return 'search';
  }

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      isLoading: true,
      searchResults: {},
      theme: props.theme,
    };

    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleSubscriptionToggle = this.handleSubscriptionToggle.bind(this);
    this.handleThemeChanged = this.handleThemeChanged.bind(this);
  }

  componentWillMount() {
    const writeData = results => {
      this.setState({
        isLoading: false,
        searchResults: {
          links: results.links,
          meta: results.meta,
          communities: results.subreddits,
        },
      });
    };

    if (this.state.data.search) {
      writeData(this.state.data.search);
    } else if (this.props.data.get('search')) {
      this.props.data.get('search')()
        .then(extractSearchResults)
        .then(writeData);
    } else { // blank search page w/ no query
      this.setState({ isLoading: false });
    }

    this.props.app.on(constants.THEME_TOGGLE, this.handleThemeChanged);
  }

  componentWillUnmount() {
    this.props.app.off(constants.THEME_TOGGLE, this.handleThemeChanged);
  }

  handleSortChange(sort) {
    this.redirectAfterNewSort({ sort });
  }

  handleTimeChange(time) {
    this.redirectAfterNewSort({ time });
  }

  handleThemeChanged(theme) {
    this.setState({ theme });
  }

  redirectAfterNewSort({ sort, time }) {
    this.props.app.redirect(this.composeUrl({
      ...this.props,
      sort: sort || this.props.sort,
      time: time || this.props.time,
      type: 'sr,link',
    }));
  }

  async handleSubscriptionToggle({ id, name, subscribe }) {
    if (this.props.app.needsToLogInUser()) { return; }
    const { app, apiOptions } = this.props;
    const currentSubscriptions = this.state.data.userSubscriptions;

    // optimistically update ui
    this.setState({
      data: {
        ...this.state.data,
        userSubscriptions: subscribe
          ? currentSubscriptions.concat({ id, name })
          : currentSubscriptions.filter(us => us.name !== name),
      },
    });

    // make the api call
    try {
      const response = await app.api.subscriptions.post({
        ...apiOptions,
        id,
        model: new models.Subscription({
          action: subscribe ? 'sub' : 'unsub',
          sr: name,
        }),
      });

      // if there is anything at all in the reponse, throw an error
      if (Object.keys(response).length) {
        throw new Error('Error');
      }

      // indicate that we have new user data
      app.emit(constants.USER_DATA_CHANGED);
    } catch (e) {
      // undo any optimistic changes
      this.setState({
        data: {
          ...this.state.data,
          userSubscriptions: subscribe
            ? currentSubscriptions.filter(us => us.name !== name)
            : currentSubscriptions.concat({ id, name }),
        },
      });

      // re throw the error
      throw e;
    }
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
    const { subredditName, query } = this.props;
    const { isLoading, searchResults } = this.state;
    const { communities, links } = searchResults;
    const noResults = isEmpty(links) && isEmpty(communities);

    return (
      <div className='SearchPage'>
        { isLoading ? this.renderLoading() : null }
        { subredditName && links ? this.renderSubredditMessage() : null }
        { !isEmpty(communities) ? this.renderCommunities() : null }
        { !isEmpty(links) ? this.renderLinks(links) : null }
        { noResults && !isLoading && query ? this.renderNoResults() : null }
        { noResults && !isLoading && !query ? this.renderHelpfulMsg() : null }
      </div>
    );
  }

  renderLoading() {
    return (
      <div className='SearchPage__loading'>
        <Loading />
      </div>
    );
  }

  renderSubredditMessage() {
    const { subredditName } = this.props;
    const { searchResults } = this.state;
    const { links } = searchResults;
    const linkMessage = 'Search all of reddit?';
    const url = this.composeUrl(omit(this.props, ['subredditName']));
    const linkCountText = links.length >= 25 ? '25+' : `${links.length}`;
    const message = `${linkCountText} matches in r/${subredditName}. `;

    return (
      <div className='SearchPage__searchAll'>
        { message }
        <a className='SearchPage__searchAllLink' href={ url }>{ linkMessage }</a>
      </div>
    );
  }

  renderCommunities() {
    const { page } = this.props;
    const { searchResults, data, theme } = this.state;
    const { userSubscriptions } = data;
    const { communities, links } = searchResults;
    const onlyShowingCommunities = !(links && links.length);
    const subscriptions = (userSubscriptions || []).reduce((prev, cur) => ({
      ...prev,
      [cur.name]: true,
    }), {});

    let prevUrl;
    if (onlyShowingCommunities && communities.length && page > 0) {
      prevUrl = this.composeUrl({
        ...this.props,
        before: page > 1 ? communities[0].name : null,
        page: page > 1 ? page - 1 : null,
        type: 'sr',
      });
    }

    let nextUrl;
    if (onlyShowingCommunities && communities.length >= 25) {
      nextUrl = this.composeUrl({
        ...this.props,
        after: communities[communities.length - 1].name,
        page: page + 1,
        type: 'sr',
      });
    }

    const drawPagination = (nextUrl || prevUrl) && communities.length;

    return (
      <div className='SearchPage__communities'>
        <div className='SearchPage__communitiesHeader clearfix'>
          <div className='SearchPage__communitiesHeaderTitle'>Communities</div>
          { !onlyShowingCommunities ? this.renderCommunitySeeMore() : null }
        </div>
        <div className='SearchPage__communitiesResults'>
          { communities.map(c => (
            <div className='SearchPage__community' key={ c.id }>
              <CommunityRow
                data={ c }
                subscribed={ !!subscriptions[c.name] }
                onToggleSubscribe={ this.handleSubscriptionToggle }
                theme={ theme }
              />
            </div>
          )) }
        </div>
        { drawPagination ? this.renderCommunityNav(prevUrl, nextUrl, communities) : null }
      </div>
    );
  }

  renderCommunitySeeMore() {
    const url = this.composeUrl({
      ...this.props,
      type: 'sr',
    });

    return (
      <a
        className='SearchPage__communitiesHeaderMore'
        href={ url }
      >
        View More
        <div className='SearchPage__communitiesHeaderMoreIcon icon-nav-arrowforward'/>
      </a>
    );
  }

  renderCommunityNav(prevUrl, nextUrl, communities) {
    return (
      <div className='SearchPage__communitiesNav clearfix'>
        <ListingPaginationButtons
          compact={ true }
          prevUrl={ prevUrl }
          nextUrl={ nextUrl }
          pageSize={ 25 }
          listings={ communities }
          preventUrlCreation={ true }
        />
      </div>
    );
  }

  renderLinks() {
    const { sort, time, app, ctx, token, apiOptions, page } = this.props;
    const { user, searchResults } = this.state;
    const { links, meta } = searchResults;

    // API is messed up, so we have to do our own detection for the prev..
    let prevUrl;
    if (meta.before || links.length && page > 0) {
      prevUrl = this.composeUrl({
        ...this.props,
        before: page > 1 ? (meta.before || links[0].name) : null,
        page: page > 1 ? page - 1 : null,
        type: page > 1 ? 'link' : 'sr,link',
      });
    }

    // ..and of course for the next too :-\
    let nextUrl;
    if (meta.after || links.length >= 22) {
      nextUrl = this.composeUrl({
        ...this.props,
        after: meta.after || links[links.length - 1].name,
        page: page + 1,
        type: 'link',
      });
    }

    return (
      <div className='SearchPage__links'>
        <div className='SearchPage__linksHeader clearfix'>
          <div className='SearchPage__linksHeaderTitle'>Posts</div>
          <div className='SearchPage__linksHeaderTools'>
            <div className='SearchPage__linksHeaderSort'>
              <SortSelector
                app={ app }
                sortValue={ sort }
                sortOptions={ [
                  SORTS.RELEVANCE,
                  SORTS.HOT,
                  SORTS.NEW,
                  SORTS.TOP,
                  SORTS.COMMENTS,
                ] }
                onSortChange={ this.handleSortChange }
              />
            </div>
            <div className='SearchPage__linksHeaderSort'>
              <SortSelector
                app={ app }
                sortValue={ time }
                sortOptions={ [
                  SORTS.ALL_TIME,
                  SORTS.PAST_YEAR,
                  SORTS.PAST_MONTH,
                  SORTS.PAST_WEEK,
                  SORTS.PAST_DAY,
                  SORTS.PAST_HOUR,
                ] }
                onSortChange={ this.handleTimeChange }
              />
            </div>
          </div>
        </div>
        <div className='SearchPage__linksResults'>
          <Listing
            forceCompact={ true }
            feature={ this.state.feature }
            app={ app }
            ctx={ ctx }
            listings={ links }
            apiOptions={ apiOptions }
            user={ user }
            token={ token }
            winWidth={ ctx.winWidth }
            compact={ true }
            pageSize={ 22 }
            prevUrl={ prevUrl }
            nextUrl={ nextUrl }
          />
        </div>
      </div>
    );
  }

  renderNoResults() {
    const { query } = this.props;

    return (
      <div className='SearchPage__noResults'>
        <div className='SearchPage__noResultsMsg'>Sorry, we couldn't find any results for</div>
        <div className='SearchPage__noresultsQuery'>'{ query }'</div>
      </div>
    );
  }

  renderHelpfulMsg() {
    return (
      <div className='SearchPage__helpfulMsg'>
        Tap the <div className='SearchPage__helpfulIcon icon-search blue' /> icon to get started.
      </div>
    );
  }
}
