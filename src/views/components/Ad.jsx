import _ from 'lodash';
import React from 'react';
import superagent from 'superagent';
import { models } from 'snoode';

import constants from '../../constants';

import Listing from './Listing';

class Ad extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      loaded: false,
    };

    this._scroll = _.throttle(this._scroll.bind(this), 100);
    this._removeListeners = this._removeListeners.bind(this);
  }

  getAd () {
    var srnames = this.props.srnames;

    // If we're not on a sub/multi, we're on the front page, so get front page
    // ads
    if (!this.props.subredditTitle) {
      srnames = ' reddit.com';
    }

    return new Promise((resolve, reject) => {
      superagent.post(this.props.adsPath)
        .type('form')
        .send({
          srnames: srnames,
          is_mobile_web: true,
        })
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

  componentDidMount () {
    this.getAd().then((ad) => {
      return this.setState({
        loaded: true,
        ad: new models.Link(ad).toJSON(),
      });
    }, () => {});

    this.props.app.on(constants.SCROLL, this._scroll);
    this.props.app.on(constants.RESIZE, this._scroll);

    this._hasListeners = true;
    this._scroll();
  }

  componentWillUnmount() {
    this._removeListeners();
  }

  _removeListeners() {
    if (this._hasListeners) {
      this.props.app.off(constants.SCROLL, this._scroll);
      this.props.app.off(constants.RESIZE, this._scroll);
      this._hasListeners = false;
    }
  }

  _scroll() {
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

  getListingElement () {
    return this.refs.listing;
  }

  render () {
    if (!this.state.loaded) {
      return (<div></div>);
    }

    var props = this.props;
    props.listing = this.state.ad;
    props.hideSubredditLabel = true;
    props.hideWhen = true;
    props.hideDomain = true;

    if (props.listing.disable_comments) {
      props.listing.permalink = undefined;
      props.hide_comments = true;
    }

    if (props.listing.mobile_ad_url) {
      props.listing.preview = {
        source: {
          url: props.listing.mobile_ad_url,
        },
      };
    }

    return (
      <div>
        <Listing {...props } ref='listing' />
      </div>
    );
  }
};

export default Ad;
