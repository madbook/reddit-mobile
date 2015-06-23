import React from 'react';
import url from 'url';

class TrackingPixel extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      loaded: false,
    };
  }

  componentDidMount () {
    var state = {
      loaded: true,
    };

    if (document && document.referrer) {
      let domain = url.parse(document.referrer).host;
      state.referrerDomain = domain;
    }

    this.setState(state);
  }

  render () {
    // Only render client-side
    if (!this.state.loaded) {
      return (<div />);
    }

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

      if (this.state.referrerDomain) {
        trackingUrl += '&referrer_domain=' + this.state.referrerDomain;
      }

      return (
        <img src={ trackingUrl } style={{ display: 'none' }} width='0' height='0' />
      );
    } else {
      return <div />;
    }
  }
}

export default TrackingPixel;
