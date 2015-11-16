import React from 'react';
import constants from '../../constants';
import propTypes from '../../propTypes';
import uniq from 'lodash/array/uniq';

import Ad from '../components/Ad';
import BaseComponent from './BaseComponent';
import CommentPreview from '../components/CommentPreview';
import Listing from '../components/Listing';

const Proptypes = React.PropTypes;

const _AD_LOCATION = 11;

class ListingList extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      adLocation: Math.min(_AD_LOCATION, props.listings.length),
      compact: this.props.compact,
    };

    this._lazyLoad = this._lazyLoad.bind(this);
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  componentDidMount() {
    this._addListeners();

    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentWillUnmount() {
    this._removeListeners();

    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _getLoadedDistance () {
    return document.body.scrollTop + window.innerHeight * 2;
  }

  _checkAdPos() {
    var loadedDistance = this._getLoadedDistance();

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
    var listings = this.props.listings;
    var loadedDistance = this._getLoadedDistance();
    var adIsMidListing = listings.length > this.state.adLocation;

    for (var i = 0; i < listings.length; i++) {
      var listing = this.refs['listing' + i];

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
    var srnames = uniq(this.props.listings.map(function(l) {
      return l.subreddit;
    }));

    return (
      <Ad
        loid={this.props.loid}
        key='ad'
        ref='ad'
        {...this.props}
        srnames={srnames}
        afterLoad={this._checkAdPos.bind(this)}
        compact={ this.state.compact }
        />
    );
  }

  render() {
    var props = this.props;
    var page = props.firstPage || 0;
    var length = props.listings.length;
    var compact = this.state.compact;
    var listings = (
      props.listings.map(function(listing, i) {

        var index = (page * 25) + i;
        if (listing._type === 'Comment') {
          return (
            <CommentPreview
              comment={listing}
              key={'page-comment-' + index}
              page={page}
            />
          );
        } else {
          if (props.showHidden || !listing.hidden) {
            return (
              <Listing
                index={index}
                key={'page-listing-' + index}
                listing={listing}
                ref={'listing' + i}
                z={length - i}
                {...props}
                compact={ compact }
              />
            );
          }
        }
      })
    );

    // If ads are enabled, splice an ad into the listings.
    if (props.showAds && listings.length) {
      listings.splice(this.state.adLocation, 0, this.buildAd());
    }

    return (
      <div ref='root'>{listings}</div>
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
    var compact = nextProps.compact;
    if (compact !== 'undefined' && compact !==this.state.compact) {
      this.setState({compact: compact});
    }
  }

  _onCompactToggle(compact) {
    this.setState({ compact });
  }

  static propTypes = {
    compact: Proptypes.bool,
    firstPage: Proptypes.number,
    listings: Proptypes.arrayOf(Proptypes.oneOfType([
      propTypes.comment,
      propTypes.listing,
    ])).isRequired,
    showAds: Proptypes.bool,
    showHidden: Proptypes.bool,
  }
}

export default ListingList;
