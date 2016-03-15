import React from 'react';

import constants from '../../../constants';

import BaseComponent from '../BaseComponent';
import ListingContainer from '../ListingContainer';
import NewListing from './NewListing';

const { LISTING_REDESIGN } = constants.flags;
const T = React.PropTypes;

export default class ListingRedesignProxy extends BaseComponent {
  // just specify that feature is required (an instance of feet)
  // as we'll redo the the real proptypes that need to be passed down
  // the new Listings
  static propTypes = {
    feature: T.object.isRequired,
    forceCompact: T.bool,
  };

  render() {
    if (this.props.feature.enabled(LISTING_REDESIGN)) {
      return this.renderListingRedesign();
    }

    return this.renderOldListings();
  }

  renderListingRedesign() {
    const {
      listings,
      app,
      config,
      ctx,
      user,
      showAds,
      loid,
      apiOptions,
      firstPage,
      page,
      hideSubredditLabel,
      subredditTitle,
      subredditIsNSFW,
      showOver18Interstitial,
      winWidth,
      compact,
      forceCompact,
      shouldPage,
      pagingPrefix,
      nextUrl,
      prevUrl,
      pageSize,
      hideUser,
      showHidden,
      listingClassName,
    } = this.props;

    return (
      <NewListing
        postsAndComments={ listings }
        apiOptions={ apiOptions }
        app={ app }
        config={ config }
        ctx={ ctx }
        user={ user }
        hideUser={ hideUser }
        showAds={ showAds }
        loid={ loid }
        winWidth={ winWidth }
        compact={ compact }
        forceCompact={ forceCompact }
        showHidden={ showHidden }
        hideSubredditLabel={ hideSubredditLabel }
        subredditTitle={ subredditTitle }
        subredditIsNSFW={ subredditIsNSFW }
        showOver18Interstitial={ showOver18Interstitial }
        shouldPage={ shouldPage }
        pagingPrefix={ pagingPrefix }
        firstPage={ firstPage }
        page={ page }
        pageSize={ pageSize }
        prevUrl={ prevUrl }
        nextUrl={ nextUrl }
        listingClassName={ listingClassName }
      />
    );
  }

  renderOldListings() {
    return <ListingContainer { ...this.props } />;
  }
}
