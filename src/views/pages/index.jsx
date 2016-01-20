import React from 'react';
import querystring from 'querystring';

import constants from '../../constants';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import Interstitial from '../components/Interstitial';
import CommunityHeader from '../components/CommunityHeader';
import NotificationBar from '../components/NotificationBar';

const FAKE_SUBS = ['mod', 'all', 'friends'];

const NOTIFICATIONS = {
  stalePage: {
    type: 'success',
    message: 'This page refreshed to show you current posts',
  },
};

class IndexPage extends BasePage {
  static propTypes = {
    before: React.PropTypes.string,
    after: React.PropTypes.string,
    data: React.PropTypes.object,
    multi: React.PropTypes.string,
    multiUser: React.PropTypes.string,
    page: React.PropTypes.number,
    prefs: React.PropTypes.shape({
      hide_ads: React.PropTypes.bool.isRequired,
    }),
    sort: React.PropTypes.string,
    subredditName: React.PropTypes.string,
  };

  static isStalePage (query, listings) {
    // detect if we are on an invalid (stale) page, and if so, redirect to
    // the front page.
    if (query.before || query.after) {
      const { body, headers } = listings;

      // We sent in pagination, but we didn't get a before/after back
      if (!headers.before && !headers.after && !body.length) {
        return true;
      }
    }
  }

  static stalePageRedirectUrl (path, query={}) {
    let qs = '';

    if (query && Object.keys(query).length > 0) {
      const q = { ...query };
      delete q.before;
      delete q.after;
      delete q.page;
      delete q.count;

      if (Object.keys(q).length > 0) {
        qs = `?${querystring.stringify(q)}`;
      }
    }

    return `${path}${qs}`;
  }

  constructor(props) {
    super(props);
    this.state.compact = props.compact;
    this.stale = false;
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  get track () {
    return 'listings';
  }

  render() {
    let loading;

    const props = this.props;
    const { data, meta, compact } = this.state;
    const { app } = props;

    const subredditName = props.subredditName;
    const isFakeSub = FAKE_SUBS.indexOf(subredditName) !== -1;

    if (!data || typeof data.listings === 'undefined' ||
        (subredditName && (!data.subreddit && !isFakeSub))) {
      return (
        <Loading />
      );
    }

    const listings = this.state.data.listings;

    // For now, do a check on the client side, which asynchornously loads data.
    // The server also does this check in routes. Eventually, refactor this in
    // such a way that it can be written in one place generically for all routes
    // and pages.
    if (!this.stale && IndexPage.isStalePage(props.ctx.query, {
      body: listings,
      headers: meta.listings,
    })) {
      app.emit('notification', 'stalePage');
      props.app.redirect(IndexPage.stalePageRedirectUrl(props.ctx.path, props.ctx.query));
      this.stale = true;
      return null;
    }

    let bypassInterstitial = data.preferences && data.preferences.over_18;

    if (!bypassInterstitial) {
      if (data.subreddit && data.subreddit.over18 && props.showOver18Interstitial) {
        return (<Interstitial  {...props} loggedIn={ data.preferences } type='over18' />);
      }
    }


    var hideSubredditLabel = props.subredditName &&
                             props.subredditName.indexOf('+') === -1 &&
                             props.subredditName !== 'all';

    var page = props.page || 0;

    var user = this.state.data.user;

    let pagingPrefix;

    if (props.subredditName) {
      pagingPrefix = '/r/' + props.subredditName;
    }

    if (props.multi) {
      pagingPrefix = '/u/' + props.multiUser + '/m/' + props.multi;
    }

    // Use the same logic for the url and for the subreddit name display
    const subreddit = pagingPrefix;

    var sort = props.sort || 'hot';
    var excludedSorts = [];

    if (!props.subredditName || props.multi) {
      excludedSorts.push('gilded');
    }

    var showAds = !!props.config.adsPath;

    if (props.prefs && props.prefs.hide_ads === true) {
      showAds = false;
    }

    let subredditIsNSFW = data.subreddit ? data.subreddit.over18 : false;

    let notificationBar;
    const notifications = props.ctx.notifications;
    if (notifications && notifications.indexOf('stalePage') !== -1) {
      notificationBar = (<NotificationBar { ...NOTIFICATIONS.stalePage } />);
    }

    return (
      <div>
        { loading }

        <CommunityHeader {...props} subreddit={ data.subreddit } />

        { notificationBar }

        <TopSubnav
          { ...props }
          user={ data.user }
          subreddit={ data.subreddit }
          sort={ sort }
          list='listings'
          excludedSorts={ excludedSorts }
        />

        <ListingContainer
          { ...props }
          user={ user }
          showAds={ showAds }
          listings={ listings }
          firstPage={ page }
          page={ page }
          hideSubredditLabel={ hideSubredditLabel }
          subredditTitle={ subreddit }
          subredditIsNSFW={ subredditIsNSFW }
          winWidth={ this.props.ctx.winWidth }
          compact={ compact }
          pagingPrefix={ pagingPrefix }
        />
      </div>
    );
  }
}

export default IndexPage;
