import React from 'react';
import isEqual from 'lodash/lang/isEqual';

import BaseComponent from '../components/BaseComponent';
import TrackingPixel from '../../lib/TrackingPixel';

class BasePage extends BaseComponent {
  constructor (props) {
    super(props);

    this.props = props;
    this.state = {
      data: {},
      meta: {},
      loaded: !!props.dataCache,
    };

    if (props.dataCache) {
      for (var k in props.dataCache) {
        props.data.set(k, Promise.resolve(props.dataCache[k]));

        if (props.dataCache[k].body) {
          this.state.data[k] = props.dataCache[k].body;
          this.state.meta[k] = props.dataCache[k].headers;

          if (this.state.meta[k].tracking && this.props.track === k) {
            this.fireTrackingPixel(this.state.meta[k].tracking);
          }
        } else {
          this.state.data[k] = props.dataCache[k];
        }
      }
    }

    for (var key of this.props.data.keys()) {
      if (!props.dataCache[key]) {
        this.watch(key);
      }
    };
  }

  watch (property) {
    this.props.data.get(property).then(function(p) {
      if (p.body) {
        var data = Object.assign({}, this.state.data);
        var meta = Object.assign({}, this.state.meta);

        data[property] = p.body;
        meta[property] = p.headers;

        if (p.headers.tracking && this.props.track === property) {
          this.fireTrackingPixel(p.headers.tracking);
        }

        this.setState({
          data: data,
          meta: meta,
        });
      } else {
        var data = Object.assign({}, this.state.data);

        data[property] = p;

        this.setState({
          data: data,
        });
      }
    }.bind(this), function(e) {
      // circular, so we can render the error page
      if (!this.props.ctx.props) {
        this.props.ctx.props = this.props;
        delete this.props.ctx.props.ctx.props;
      }

      this.props.app.error(e, this.props.ctx, this.props.app);
    }.bind(this));
  }

  buildTrackingPixelProps(url, props) {
    return {
      url: url,
      referrer: props.ctx.referrer,
      loid: props.loid,
      loidcreated: props.loidcreated,
      user: props.user,
      compact: props.compact,
    };
  }

  fireTrackingPixel(url) {
    let trackingProps = this.buildTrackingPixelProps(url, this.props);
    let pixel = new TrackingPixel(trackingProps);
    pixel.fire();
  }

  componentDidMount() {
    this.props.app.emit('page:update', this.props);
  }
}

BasePage.propTypes = {
  ctx: React.PropTypes.object.isRequired,
  data: React.PropTypes.object.isRequired,
  app: React.PropTypes.object.isRequired,
};

export default BasePage;
