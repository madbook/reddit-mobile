import React from 'react';
import constants from '../../constants';

import Listing from '../components/Listing';
import CommentPreview from '../components/CommentPreview';

class ListingList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this._scroll = this._scroll.bind(this);
    this._resize = this._resize.bind(this);
    this._removeListeners = this._removeListeners.bind(this);
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
      if (ref) {
        var keepGoing = ref.checkPos(winHeight);
        if (!keepGoing) {
          return;
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
    if (this.props.compact) {
      for (var i = 0; i < this.length; i++) {
        var ref = this.refs['listing' + i];
        if (ref) {
          ref.resize();
        }
      }
    }
  }

  render() {
    var props = this.props;
    var page = props.firstPage || 0;
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
          if (!listing.hidden) {
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
    this.length = listings.length;

    return <span>{listings}</span>;
  }
}

export default ListingList;
