import React from 'react';
import constants from '../../constants';

import BasePage from './BasePage';
import ListingContainer from '../components/ListingContainer';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import Interstitial from '../components/Interstitial';
import CommunityHeader from '../components/CommunityHeader';

class IndexPage extends BasePage {
  constructor(props) {
    super(props);
    this.state.compact = props.compact;
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
    var loading;
    var props = this.props;
    var { data, compact } = this.state;

    var subredditName = props.subredditName;
    var fakeSubs = ['mod', 'all', 'friends'];
    var isFakeSub = fakeSubs.indexOf(subredditName) !== -1;

    if (!data || !data.listings ||
        (subredditName && (!data.subreddit && !isFakeSub))) {
      return (
        <Loading />
      );
    }

    let bypassInterstitial = data.preferences && data.preferences.over_18;
    if (!bypassInterstitial) {
      if (data.subreddit && data.subreddit.over18 && props.showOver18Interstitial) {
        return (<Interstitial  {...props} loggedIn={ data.preferences } type='over18' />);
      }
    }
    var listings = this.state.data.listings;

    var hideSubredditLabel = props.subredditName &&
                             props.subredditName.indexOf('+') === -1 &&
                             props.subredditName !== 'all';

    var page = props.page || 0;

    var user = this.state.data.user;

    let pagingPrefix = '';

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

    return (
      <div>
        { loading }

        <CommunityHeader {...props} subreddit={ data.subreddit } />

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

IndexPage.propTypes = {
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

export default IndexPage;
