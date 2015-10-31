import React from 'react';
import constants from '../../constants';
import { models } from 'snoode';
import superagent from 'superagent';

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
      return true;
    }

    return listing.checkPos.apply(listing, arguments);
  }

  getAd() {
    var srnames = this.props.srnames;
    const specificAd = this.props.ctx.query.ad;

    if (specificAd) {
      return new Promise(function (resolve, reject) {
        const options = Object.assign({}, this.props.apiOptions, { id: specificAd });

        this.props.app.api.links.get(options)
          .then((link) => {
            resolve(new models.Link(link).toJSON());
          }, (err) => {
            reject(err);
          });
      }.bind(this));
    }

    // If we're not on a sub/multi, we're on the front page, so get front page
    // ads
    if (!this.props.subredditTitle) {
      srnames = ' reddit.com';
    }

    var app = this.props.app;
    var loggedIn = !!this.props.token;
    var origin = (loggedIn ?
      app.config.authAPIOrigin :
        app.config.nonAuthAPIOrigin)
    var headers = {};
    var postData = {
      srnames: srnames,
      is_mobile_web: true,
      raw_json: '1',
    };

    // If user is not logged in, send the loid in the promo request
    if (loggedIn) {
      headers.authorization = 'bearer ' + this.props.token;
    } else {
      postData.loid = this.props.loid;
    }

    return new Promise((resolve, reject) => {
      superagent.post(origin + this.props.config.adsPath)
        .set(headers)
        .type('form')
        .send(postData)
        .end(function(err, res) {
          if (err) {
            return reject(err);
          }

          if (res && res.status === 200 && res.body) {
            var link = res.body.data;
            link.url = link.href_url;

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

    this.props.app.on(constants.SCROLL, this._checkImpression);
    this.props.app.on(constants.RESIZE, this._checkImpression);

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
      this.props.app.off(constants.SCROLL, this._checkImpression);
      this.props.app.off(constants.RESIZE, this._checkImpression);
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
        hideDomain={true}
        hideSubredditLabel={true}
        hideWhen={true}
        listing={listing} />
    );
  }
};

Ad.propTypes = {
  afterLoad: React.PropTypes.func.isRequired,
  compact: React.PropTypes.bool.isRequired,
  token: React.PropTypes.string,
};

export default Ad;
