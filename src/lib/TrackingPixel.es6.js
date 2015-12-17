import url from 'url';

class TrackingPixel {
  constructor (props) {
    this.props = props;
  }

  fire () {
    if (typeof Image === 'undefined') {
      return;
    }

    if (this.props.url) {
      var trackingUrl = this.props.url + '&r=' + Math.random();

      if (this.props.referrer) {
        let domain = url.parse(this.props.referrer).host;
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

      var experiments = this.props.experiments;
      if (experiments && experiments.length) {
        trackingUrl += '&exps=' + experiments.map((e) => {
          return e.id + ':' + e.value;
        }).join(';');
      }

      var img = new Image();
      img.src = trackingUrl;
    }
  }
}

export default TrackingPixel;
