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
      var trackingUrl = this.props.url + '&' + Math.random();

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
