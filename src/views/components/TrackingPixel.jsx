import React from 'react';
import globals from '../../globals';
import url from 'url';
import BaseComponent from './BaseComponent';

class TrackingPixel extends BaseComponent {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    if (this.props.url) {
      var trackingUrl = this.props.url + '&r=' + Math.random();

      if (this.props.referrer) {
        let domain = url.parse(this.props.referrer).host;
        trackingUrl += '&referrer_domain=' + domain;
      }

      if (!globals().user && globals().loid) {
        trackingUrl += '&loid=' + globals().loid;
        trackingUrl += '&loidcreated=' + globals().loidcreated;
      }

      if (globals().compact) {
        trackingUrl += '&view_type=compact';
      } else {
        trackingUrl += '&view_type=list';
      }

      var experiments = globals().experiments;
      if (experiments && experiments.length) {
        trackingUrl += '&exps=' + experiments.map((e) => {
          return e.id + ':' + e.value;
        }).join(';');
      }

      var img = new Image();
      img.src = trackingUrl;
    }
  }

  render () {
    return null;
  }
}

export default TrackingPixel;
