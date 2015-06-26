import _ from 'lodash';
import React from 'react';
import constants from '../../constants';
import Listing from '../components/Listing';
import CommentPreview from '../components/CommentPreview';
import Ad from '../components/Ad';

const AD_LOCATION = 11;

class ListingList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      adLocation: Math.min(AD_LOCATION, props.listings.length)
    };

    this._lazyLoad = this._lazyLoad.bind(this);
    this._resize = this._resize.bind(this);
  }

  componentDidMount() {
    this._hasListeners = true;
    this.props.app.on(constants.SCROLL, this._lazyLoad);
    this.props.app.on(constants.RESIZE, this._lazyLoad);
    this.props.app.on(constants.RESIZE, this._resize);
    this._lazyLoad();
    this._resize();
  }

  componentWillUnmount() {
    this._removeListeners();
    this.props.app.off(constants.RESIZE, this._resize);
  }

  _getLoadedDistance () {
    return window.innerHeight * 2;
  }

  _checkAdPos() {
    var loadedDistance = this._getLoadedDistance();

    if (!this.refs.ad) {
      return false;
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

  _removeListeners() {
    if (this._hasListeners) {
      this.props.app.off(constants.SCROLL, this._lazyLoad);
      this.props.app.off(constants.RESIZE, this._lazyLoad);
      this._hasListeners = false;
    }
  }

  _resize() {
    var width = this.refs.root.getDOMNode().offsetWidth;
    for (var i = 0; i < this.props.listings.length; i++) {
      var ref = this.refs['listing' + i];

      ref.resize && ref.resize(width);
    }

    if (this.refs.ad) {
      this.refs.ad.resize(width);
    }
  }

  buildAd() {
    var srnames = _.uniq(this.props.listings.map(function(l) {
      return l.subreddit;
    }));

    return (
      <Ad
        key='ad'
        ref='ad'
        {...this.props}
        srnames={srnames}
        afterLoad={this._checkAdPos.bind(this)}
        />
    );
  }

  render() {
    var props = this.props;
    var page = props.firstPage || 0;
    var length = props.listings.length;

    var listings = (
      props.listings.map(function(listing, i) {

        var index = (page * 25) + i;
        if (listing._type === 'Comment') {
          return (
            <CommentPreview
              comment={listing}
              key={'page-comment-' + index}
              page={page}
              ref={'listing' + i}
            />
          );
        } else {
          if (props.showHidden || !listing.hidden) {
            return (
              <Listing
                ref={'listing' + i}
                index={index}
                key={'page-listing-' + index}
                listing={listing}
                z={length - i}
                {...props}
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
    if (prevProps.compact !== this.props.compact) {
      this._resize();
      this._lazyLoad();
    }
  }
}

export default ListingList;
