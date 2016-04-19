import React from 'react';
import { models } from '@r/api-client';

import constants from '../../constants';
import BaseComponent from './BaseComponent';
import Post from './listings/Post';

import makeRequest from '../../lib/makeRequest';

const T = React.PropTypes;

class Ad extends BaseComponent {
  static propTypes = {
    winWidth: T.number.isRequired,
    app: T.object.isRequired,
    config: T.object.isRequired,
    apiOptions: T.object.isRequired,
    ctx: T.object.isRequired,
    loid: T.string,
    compact: T.bool.isRequired,
    site: T.string.isRequired,
    subredditTitle: T.string,
    afterLoad: T.func.isRequired,
  };

  static defaultProps = {
    listingRedesign: false,
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
    
    return listing.loadContentIfNeeded(...arguments);
  }

  getAd() {
    const site = this.props.site;
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

    const app = this.props.app;
    const token = this.props.ctx.token;
    const loggedIn = !!token;
    const origin = (loggedIn ? app.config.authAPIOrigin : app.config.nonAuthAPIOrigin);
    const headers = {};
    const postData = {
      site,
      platform: 'mobile_web',
      raw_json: '1',
    };

    // If user is not logged in, send the loid in the promo request
    if (loggedIn) {
      headers.authorization = `Bearer ${token}`;
    } else {
      postData.loid = this.props.loid;
    }

    return makeRequest
      .post(origin + this.props.config.adsPath)
      .set(headers)
      .type('form')
      .send(postData)
      .timeout(constants.DEFAULT_API_TIMEOUT)
      .then(function(res) {
        if (!res || !res.body || res.status !== 200) {
          throw res;
        }
        const link = res.body.data;
        link.url = link.href_url;
        return new models.Link(link).toJSON();
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
      <Post
        ref='listing'
        {...props}
        hideDomain={ true }
        hideSubredditLabel={ true }
        hidewhen={ true }
        post={ listing }
      />
    );
  }
}

export default Ad;
