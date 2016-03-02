import React from 'react';
import { models } from 'snoode';
import superagent from 'superagent';

import constants from '../../constants';
import BaseComponent from './BaseComponent';
import Listing from './Listing';

class Ad extends BaseComponent {
  static propTypes = {
    afterLoad: React.PropTypes.func.isRequired,
    compact: React.PropTypes.bool.isRequired,
    token: React.PropTypes.string,
  };
  
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

    const listing = this.refs.listing;

    if (!listing) {
      return true;
    }

    return listing.checkPos(...arguments);
  }

  getAd() {
    let srnames = this.props.srnames;
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

    const app = this.props.app;
    const loggedIn = !!this.props.token;
    const origin = (loggedIn ? app.config.authAPIOrigin : app.config.nonAuthAPIOrigin);
    const headers = {};
    const postData = {
      srnames,
      is_mobile_web: true,
      raw_json: '1',
    };

    // If user is not logged in, send the loid in the promo request
    if (loggedIn) {
      headers.authorization = `Bearer ${this.props.token}`;
    } else {
      postData.loid = this.props.loid;
    }

    return new Promise((resolve, reject) => {
      superagent.post(origin + this.props.config.adsPath)
        .set(headers)
        .type('form')
        .send(postData)
        .timeout(constants.DEFAULT_API_TIMEOUT)
        .end(function(err, res) {
          if (err) {
            return reject(err);
          }

          if (res && res.status === 200 && res.body) {
            const link = res.body.data;
            link.url = link.href_url;

            return resolve(new models.Link(link).toJSON());
          }

          return reject(res);
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
    const adObject = this.state.ad;

    if (adObject) {
      const node = this.domNode;
      const winHeight = window.innerHeight;
      const rect = node.getBoundingClientRect();
      const top = rect.top;
      const height = rect.height;
      const bottom = top + rect.height;
      const middle = (top + bottom) / 2;
      const middleIsAboveBottom = middle < winHeight;
      const middleIsBelowTop = bottom > constants.TOP_NAV_HEIGHT + height / 2;

      if (middleIsAboveBottom && middleIsBelowTop) {
        const srcs=['imp_pixel', 'adserver_imp_pixel'];

        for (let i = 0, iLen = srcs.length; i < iLen; i++) {
          const pixel = new Image();
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

    const props = this.props;
    const listing = Object.assign({}, this.state.ad, { compact: props.compact });

    return (
      <Listing
        ref='listing'
        {...props}
        hideDomain={ true }
        hideSubredditLabel={ true }
        hideWhen={ true }
        listing={ listing }
      />
    );
  }
}

export default Ad;
