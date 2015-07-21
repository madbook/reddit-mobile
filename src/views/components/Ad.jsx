import React from 'react';
import superagent from 'superagent';
import { models } from 'snoode';


import constants from '../../constants';
import globals from '../../globals';

import BaseComponent from './BaseComponent';
import Listing from './Listing';

class Ad extends BaseComponent {
  constructor (props) {
    super(props);

    this.state = {
      loaded: false,
      unavailable: false,
    };

    this._checkImpression = this._checkImpression.bind(this);

    this._removeListeners = this._removeListeners.bind(this);
  }

  checkPos() {
    if (this.state.unavailable) {
      return true;
    }

    var listing = this.refs.listing;

    if (!listing) {
      return false;
    }

    return listing.checkPos.apply(listing, arguments);
  }

  resize() {
    if (this.state.unavailable) {
      return;
    }

    var listing = this.refs.listing;

    if (!listing) {
      return;
    }

    listing.resize.apply(listing, arguments);
  }

  getAd() {
    var srnames = this.props.srnames;

    // If we're not on a sub/multi, we're on the front page, so get front page
    // ads
    if (!this.props.subredditTitle) {
      srnames = ' reddit.com';
    }

    var app = globals().app;
    var loggedIn = !!this.props.token;
    var origin = (loggedIn ?
      app.config.authAPIOrigin :
        app.config.nonAuthAPIOrigin)
    var headers = {};
    var postData = {
      srnames: srnames,
      is_mobile_web: true,
    };

    // If user is not logged in, send the loid in the promo request
    if (loggedIn) {
      headers.authorization = 'bearer ' + this.props.token;
    } else {
      postData.loid = app.state.loid;
    }

    return new Promise((resolve, reject) => {
      superagent.post(origin + this.props.adsPath)
        .set(headers)
        .type('form')
        .send(postData)
        .end(function(err, res) {
          if (err) {
            return reject(err);
          }

          if (res && res.status === 200 && res.body) {
            var link = res.body.data;
            link.url = link.href_url.replace(/&amp;/g, '&');

            link.imp_pixel = link.imp_pixel.replace(/&amp;/g, '&');
            link.adserver_imp_pixel = link.adserver_imp_pixel.replace(/&amp;/g, '&');
            return resolve(new models.Link(link).toJSON());
          } else {
            return reject(res);
          }
        });
      });
  }

  componentDidMount() {
    this.getAd().then((ad) => {
      return this.setState({
        loaded: true,
        ad: new models.Link(ad).toJSON(),
      });
    }, () => {
      this.setState({
        unavailable: true,
      });
    });

    globals().app.on(constants.SCROLL, this._checkImpression);
    globals().app.on(constants.RESIZE, this._checkImpression);

    this._hasListeners = true;
    this._checkImpression();
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.loaded && this.state.loaded) {
      this.props.afterLoad();
      this._checkImpression();
    }
  }

  componentWillUnmount() {
    this._removeListeners();
  }

  _removeListeners() {
    if (this._hasListeners) {
      globals().app.off(constants.SCROLL, this._checkImpression);
      globals().app.off(constants.RESIZE, this._checkImpression);
      this._hasListeners = false;
    }
  }

  _checkImpression() {
    var adObject = this.state.ad;
    if (adObject) {
      var node = React.findDOMNode(this);
      var winHeight = window.innerHeight;
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var height = rect.height;
      var bottom = top + rect.height;
      var middle = (top + bottom) / 2;
      var middleIsAboveBottom = middle < winHeight;
      var middleIsBelowTop = bottom > constants.TOP_NAV_HEIGHT + height / 2;
      if(middleIsAboveBottom && middleIsBelowTop) {
        var srcs=['imp_pixel', 'adserver_imp_pixel'];
        for (var i = 0, iLen = srcs.length; i < iLen; i++) {
          var pixel = new Image();
          pixel.src = adObject[srcs[i]];
        }
        this._removeListeners();
      }
    }
  }

  render() {
    if (!this.state.loaded || this.state.unavailable) {
      return null;
    }

    var props = this.props;
    var listing = Object.assign({}, this.state.ad, { compact: props.compact });

    return (
      <Listing
        ref='listing'
        {...props}
        listing={listing}
        hideSubredditLabel={true}
        hideDomain={true}
        hideWhen={true} />
    );
  }
};

Ad.propTypes = {
  afterLoad: React.PropTypes.func.isRequired,
  compact: React.PropTypes.bool.isRequired,
  token: React.PropTypes.string,
};

export default Ad;
