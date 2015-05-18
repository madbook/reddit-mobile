import React from 'react';

class TrackingPixel extends React.Component {
  constructor (props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  render () {
    if (this.props.url) {
      var trackingUrl = this.props.url + '&r=' + Math.random();

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

      return (
        <img src={ trackingUrl } style={{ display: 'none' }} width='0' height='0' />
      );
    } else {
      return <div />;
    }
  }
}

function TrackingPixelFactory(app) {
  return app.mutate('core/components/trackingPixel', TrackingPixel);
}

export default TrackingPixelFactory;
