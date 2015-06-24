import React from 'react';
import url from 'url';

class TrackingPixel extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    if (this.props.url) {
      var trackingUrl = this.props.url + '&r=' + Math.random();
      var referrer;

      if (document && document.referrer) {
        let domain = url.parse(document.referrer).host;
        trackingUrl += '&referrer_domain=' + domain;
      }

      if (!this.props.user && this.props.loid) {
        trackingUrl += '&loid=' + this.props.loid;
        trackingUrl += '&loidcreated=' + this.props.loidcreated;
      }

      if (this.props.compact) {
        trackingUrl += '&view_type=compact';
      } else {
        trackingUrl += '&view_type=list';
      }

      if (this.props.experiments && this.props.experiments.length) {
        trackingUrl += '&exps=' + this.props.experiments.map((e) => {
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
