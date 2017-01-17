import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import url from 'url';

const T = React.PropTypes;

const selector = createSelector(
  ({compact}) => compact,
  ({user}) => user,
  ({loid}) => loid,
  ({platform}) => platform,
  ({tracking}) => tracking,
  (compact, user, loid, platform, tracking) => ({
    compact,
    dnt: !!global.DO_NOT_TRACK,
    loid: user.loggedOut ? loid.loid : null,
    loidCreated: user.loggedOut ? loid.loidCreated : null,
    referrer: platform.currentPage.referrer,
    pixelTrackerUrl: tracking.pixel,
  })
);

class TrackingPixel extends React.Component {
  componentDidMount() {
    this.fire();
  }

  shouldComponentUpdate(nextProps) {
    // prevent re-firing if platform updates but we don't get a new tracking pixel
    return nextProps.pixelTrackerUrl !== this.props.pixelTrackerUrl;
  }

  componentDidUpdate() {
    this.fire();
  }

  fire () {
    const {
      compact,
      dnt,
      loid,
      loidCreated,
      referrer,
      pixelTrackerUrl,
    } = this.props;

    if (typeof Image === 'undefined') { return; }
    if (!pixelTrackerUrl) { return; }

    let trackingUrl = `${pixelTrackerUrl}&r=${Math.random()}`;

    if (referrer) {
      const domain = url.parse(referrer).host;
      if (domain) {
        trackingUrl += `&referrer_domain=${domain}`;
      }
    }

    if (loid && loidCreated) {
      trackingUrl += `&loid=${loid}`;
      trackingUrl += `&loidcreated=${loidCreated}`;
    }

    if (compact) {
      trackingUrl += '&view_type=compact';
    } else {
      trackingUrl += '&view_type=list';
    }

    trackingUrl += `&dnt=${dnt}`;

    const img = new Image();
    img.src = trackingUrl;
  }

  render() {
    return null;
  }
}

TrackingPixel.propTypes = {
  compact: T.bool,
  dnt: T.bool,
  loid: T.string,
  loidCreated: T.number,
  referrer: T.string,
  pixelTrackerUrl: T.string,
};

TrackingPixel.defaultProps = {
  compact: false,
  dnt: false,
  loid: '',
  loidCreated: '',
  referrer: '',
  pixelTrackerUrl: '',
};

export default connect(selector)(TrackingPixel);
