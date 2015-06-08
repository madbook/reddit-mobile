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

    this._scroll = this._scroll.bind(this);
    this._resize = this._resize.bind(this);
  }

  componentDidMount() {
    this._hasListeners = true;
    this.props.app.on(constants.SCROLL, this._scroll);
    this.props.app.on(constants.RESIZE, this._scroll);
    this.props.app.on(constants.RESIZE, this._resize);
    this._scroll();
    this._resize();
  }

  componentWillUnmount() {
    this._removeListeners();
    this.props.app.off(constants.RESIZE, this._resize);
  }

  _scroll() {
    var winHeight = window.innerHeight * 2;
    for (var i = 0; i < this.length; i++) {
      var ref = this.refs['listing' + i];
      if (ref && ref.checkPos) {
        var keepGoing = ref.checkPos(winHeight);
        if (!keepGoing) {
          if (i === this.state.adLocation) {
            var adRef = this.refs.ad;

            if (adRef) {
              var listing = adRef.getListingElement();
              if (listing && listing.checkPos(winHeight)) {
                return;
              }
            }
          } else {
            return;
          }
        }
      }
    }
    this._removeListeners();
  }

  _removeListeners() {
    if (this._hasListeners) {
      this.props.app.off(constants.SCROLL, this._scroll);
      this.props.app.off(constants.RESIZE, this._scroll);
      this._hasListeners = false;
    }
  }

  _resize() {
    var width = this.refs.root.getDOMNode().offsetWidth;
    for (var i = 0; i < this.length; i++) {
      var ref = this.refs['listing' + i];
      if (ref) {
        ref.resize(width);
      }
    }
  }

  buildAd() {
    if (this.props.listings.length > 0) {
      var srnames = _.uniq(this.props.listings.map(function(l) {
        return l.subreddit;
      }));

      return (
        <Ad { ...this.props } srnames={srnames} key='ad' ref='ad' />
      );
    }
  }

  render() {
    var props = this.props;
    var page = props.firstPage || 0;

    var ad;

    var listings = (
      props.listings.map(function(listing, i) {

        var index = (page * 25) + i;
        if (listing._type === 'Comment') {
          return (
            <CommentPreview
              random={props.random}
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
                {...props}
              />
            );
          }
        }
      })
    );

    // If ads are enabled, splice an ad into the listings.
    if (this.props.showAds && listings.length) {
      ad = this.buildAd();
      listings.splice(this.state.adLocation, 0, ad);
    }

    this.length = listings.length;

    return <div ref='root'>{listings}</div>;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.compact !== this.props.compact) {
      this._resize();
    }
  }
}

export default ListingList;
