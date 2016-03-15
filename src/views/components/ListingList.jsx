import React from 'react';

import constants from '../../constants';
import propTypes from '../../propTypes';

import Ad from '../components/Ad';
import BaseComponent from './BaseComponent';
import CommentPreview from '../components/CommentPreview';
import Listing from '../components/Listing';

const Proptypes = React.PropTypes;

const _AD_LOCATION = 11;
const FRONTPAGE_NAME = ' reddit.com';
const FRONTPAGE_SUBREDDITS = {
  'all': true,
};

class ListingList extends BaseComponent {
  static propTypes = {
    compact: Proptypes.bool,
    firstPage: Proptypes.number,
    listings: Proptypes.arrayOf(Proptypes.oneOfType([
      propTypes.comment,
      propTypes.listing,
    ])).isRequired,
    showAds: Proptypes.bool,
    showHidden: Proptypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      adLocation: Math.min(_AD_LOCATION, props.listings.length),
      compact: this.props.compact,
    };

    this._lazyLoad = this._lazyLoad.bind(this);
    this._checkAdPos = this._checkAdPos.bind(this);
  }

  componentDidMount() {
    this._addListeners();
  }

  componentWillUnmount() {
    this._removeListeners();
  }

  _getLoadedDistance () {
    return document.body.scrollTop + window.innerHeight * 2;
  }

  _checkAdPos() {
    const loadedDistance = this._getLoadedDistance();

    if (!this.refs.ad) {
      return true;
    }

    return this.refs.ad.checkPos(loadedDistance);
  }

  _hasAd() {
    return this.props.showAds && this.refs.ad;
  }

  _isIndexOfAd(index) {
    return this._hasAd() && index === this.state.adLocation;
  }

  _lazyLoad() {
    const listings = this.props.listings;
    const loadedDistance = this._getLoadedDistance();

    let i;
    for (i = 0; i < listings.length; i++) {
      const listing = this.refs[`listing${i}`];

      // commentpreviews are stateless, so the ref won't exist.
      if (!listing) {
        return;
      }

      // Check ad first since it'll be before the `i`th listing.
      if (this._isIndexOfAd(i) && !this._checkAdPos()) {
        return;
      }

      if (listing.checkPos && !listing.checkPos(loadedDistance)) {
        return;
      }
    }

    // Ad is after all the listings
    if (this._hasAd() && !this._checkAdPos()) {
      return;
    }

    this._removeListeners();
  }

  _addListeners() {
    if (!this._hasListeners) {
      this._hasListeners = true;
      this.props.app.on(constants.SCROLL, this._lazyLoad);
      this.props.app.on(constants.RESIZE, this._lazyLoad);
      this._lazyLoad();
    }
  }

  _removeListeners() {
    if (this._hasListeners) {
      this.props.app.off(constants.SCROLL, this._lazyLoad);
      this.props.app.off(constants.RESIZE, this._lazyLoad);
      this._hasListeners = false;
    }
  }

  buildAd() {
    let site = FRONTPAGE_NAME;

    if (this.props.multi) {
      site = `/user/${this.props.multiUser}/m/${this.props.multi}`;
    } else if (this.props.subredditName &&
        !FRONTPAGE_SUBREDDITS[this.props.subredditName]) {
      site = this.props.subredditName;
    }

    return (
      <Ad
        loid={ this.props.loid }
        key='ad'
        ref='ad'
        {...this.props}
        site={ site }
        afterLoad={ this._checkAdPos }
        compact={ this.state.compact }
      />
    );
  }

  render() {
    const props = this.props;
    const page = props.firstPage || 0;
    const length = props.listings.length;
    const compact = this.state.compact;

    const listings = (
      props.listings.map(function(listing, i) {
        const index = (page * 25) + i;

        if (listing._type === 'Comment') {
          return (
            <CommentPreview
              comment={ listing }
              key={ `page-comment-${index}` }
              page={ page }
            />
          );
        }

        if (props.showHidden || !listing.hidden) {
          return (
            <Listing
              index={ index }
              key={ `page-listing-${index}` }
              listing={ listing }
              ref={ `listing${i}` }
              z={ length - i }
              subredditIsNSFW={ props.subredditIsNSFW }
              {...props}
              compact={ compact }
            />
          );
        }
      })
    );

    // If ads are enabled, splice an ad into the listings.
    if (props.showAds && listings.length) {
      listings.splice(this.state.adLocation, 0, this.buildAd());
    }

    return (
      <div className={ this.props.className } ref='root'>{ listings }</div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.compact !== this.state.compact) {
      this._lazyLoad();
    }
    if (prevProps.listings !== this.props.listings) {
      this._addListeners();
    }
  }

  componentWillReceiveProps(nextProps) {
    const compact = nextProps.compact;
    if (compact !== 'undefined' && compact !== this.state.compact) {
      this.setState({compact});
    }
  }
}

export default ListingList;
