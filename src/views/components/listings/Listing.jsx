import React from 'react';

import constants from '../../../constants';
import propTypes from '../../../propTypes';

import BaseComponent from '../BaseComponent';
import PostAndCommentList from './PostAndCommentList';
import ListingPaginationButtons from './ListingPaginationButtons';

const T = React.PropTypes;

export default class Listing extends BaseComponent {
  static propTypes = {
    listings: propTypes.postsAndComments.isRequired,
    app: T.object.isRequired,
    config: T.object,
    ctx: T.object.isRequired,
    user: propTypes.user,
    showAds: T.bool,
    loid: T.string,
    apiOptions: T.object.isRequired,
    firstPage: T.number,
    page: T.number,
    hideSubredditLabel: T.bool,
    subredditName: T.string,
    subredditTitle: T.string,
    subredditIsNSFW: T.bool,
    showOver18Interstitial: T.bool,
    winWidth: T.number,
    compact: T.bool.isRequired,
    forceCompact: T.bool,
    shouldPage: T.bool,
    pagingPrefix: T.string,
    nextUrl: T.string,
    prevUrl: T.string,
    pageSize: T.number,
    hideUser: T.bool,
    showHidden: T.bool,
    listingClassName: T.string,
  };

  static defaultProps = {
    forceCompact: false,
    shouldPage: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact || this.props.forceCompact,
    };

    this.onCompactToggle = this.onCompactToggle.bind(this);
  }

  componentDidMount() {
    if (!this.props.forceCompact) {
      this.props.app.on(constants.COMPACT_TOGGLE, this.onCompactToggle);
    }
  }

  componentWillUnmount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this.onCompactToggle);
  }

  onCompactToggle(compact) {
    this.setState({ compact });
  }

  render() {
    const {
      listings,
      apiOptions,
      app,
      config,
      ctx,
      user,
      showAds,
      loid,
      showHidden,
      shouldPage,
      firstPage,
      winWidth,
      hideSubredditLabel,
      subredditName,
      subredditTitle,
      subredditIsNSFW,
      showOver18Interstitial,
      listingClassName,
    } = this.props;

    const compact = this.state.compact || this.props.forceCompact;
    const shouldRenderPaginationButtons = shouldPage && listings.length;

    return (
      <div className='Listing'>
        <PostAndCommentList
          className={ listingClassName }
          postsAndComments={ listings }
          apiOptions={ apiOptions }
          compact={ compact }
          winWidth={ winWidth }
          firstPage={ firstPage }
          app={ app }
          config={ config }
          ctx={ ctx }
          user={ user }
          showAds={ showAds }
          loid={ loid }
          showHidden={ showHidden }
          hideSubredditLabel={ hideSubredditLabel }
          subredditName={ subredditName }
          subredditTitle={ subredditTitle }
          subredditIsNSFW={ subredditIsNSFW }
          showOver18Interstitial={ showOver18Interstitial }
        />
        { shouldRenderPaginationButtons ? this.renderPaginationButtons(compact) : null }
      </div>
    );
  }

  renderPaginationButtons(compactState) {
    const {
      listings,
      pagingPrefix,
      pageSize,
      prevUrl,
      nextUrl,
      ctx,
    } = this.props;

    return (
      <ListingPaginationButtons
        pagingPrefix={ pagingPrefix }
        listings={ listings }
        compact={ compactState }
        ctx={ ctx }
        pageSize={ pageSize }
        prevUrl={ prevUrl }
        nextUrl={ nextUrl }
      />
    );
  }
}
