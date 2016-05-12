import url from 'url';

class TrackingPixel {
  constructor (props) {
    this.props = props;
  }

  fire () {
    if (typeof Image === 'undefined') {
      return;
    }

    const { props } = this;

    if (props.url) {
      let trackingUrl = `${props.url}&r=${Math.random()}`;

      if (props.referrer) {
        const domain = url.parse(props.referrer).host;
        trackingUrl += `&referrer_domain=${domain}`;
      }

      if (!props.user && props.loid) {
        trackingUrl += `&loid=${props.loid}`;
        trackingUrl += `&loidcreated=${props.loidcreated}`;
      }

      if (props.compact) {
        trackingUrl += '&view_type=compact';
      } else {
        trackingUrl += '&view_type=list';
      }

      trackingUrl += `&dnt=${this.props.dnt}`;

      const experiments = this.props.experiments;

      if (experiments && experiments.length) {
        trackingUrl += '&exps=';
        trackingUrl += experiments.map((e) => {
          return `${e.id}:${e.value}`;
        }).join(';');
      }

      const img = new Image();
      img.src = trackingUrl;
    }
  }
}

export default TrackingPixel;
