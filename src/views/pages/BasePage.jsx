import React from 'react';
import isEqual from 'lodash/lang/isEqual';

import features from '../../featureflags';

import BaseComponent from '../components/BaseComponent';
import TrackingPixel from '../../lib/TrackingPixel';
import constants from '../../constants';

class BasePage extends BaseComponent {
  static propTypes = {
    ctx: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    app: React.PropTypes.object.isRequired,
  };

  get track() {
    return true;
  }

  constructor (props) {
    super(props);

    this.props = props;

    this.state = {
      data: {},
      meta: {},
      loaded: !!props.dataCache,
      finished: false,
    };

    const state = this.state;

    this.state.feature = features.withContext({
      props,
      state,
    });

    if (props.dataCache) {
      let k;
      for (k in props.dataCache) {
        props.data.set(k, Promise.resolve(props.dataCache[k ]));

        if (props.dataCache[k] && props.dataCache[k].body) {
          this.state.data[k] = props.dataCache[k].body;
          this.state.meta[k] = props.dataCache[k].headers;

          if (this.state.meta[k].tracking && this.track === k) {
            this.fireTrackingPixel(this.state.meta[k].tracking);
          }
        } else {
          this.state.data[k] = props.dataCache[k];

          if (k === 'subreddit') {
            props.app.emit(constants.SET_META_COLOR,
              props.dataCache[k].key_color || constants.DEFAULT_KEY_COLOR);
          }
        }
      }
    }

    this.watchProperties();
  }

  watchProperties() {
    // Handle no-data error-page case
    if (this.props.data) {
      let key;
      for (key of this.props.data.keys()) {
        if (!this.props.dataCache[key]) {
          this.watch(key);
        }
      }

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.props.dataCache).sort())) {
        this.finish();
      }
    }
  }

  watch (property) {
    const promise = this.props.data.get(property);

    promise.then((p) => {
      let data;
      if (p.body) {
        data = Object.assign({}, this.state.data);
        const meta = Object.assign({}, this.state.meta);

        data[property] = p.body;
        meta[property] = p.headers;

        if (p.headers.tracking && this.track === property) {
          this.fireTrackingPixel(p.headers.tracking);
        }

        this.setState({
          data,
          meta,
        });

        if (property === 'preferences') {
          this.props.app.emit(constants.TOGGLE_OVER_18, p.body.over_18);
        }
      } else {
        data = Object.assign({}, this.state.data);

        data[property] = p;

        if (property === 'subreddit') {
          this.props.app.emit(constants.SET_META_COLOR, p.key_color || constants.DEFAULT_KEY_COLOR);
        }

        this.setState({
          data,
        });
      }

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }, (e) => {
      // keep every listener from error logging - only log the first failure on
      // the promise.
      if (!promise.failed) {
        promise.failed = true;
        this.props.app.error(e, this.props.ctx, this.props.app);
        this.props.app.forceRender(this.props.ctx.body, this.props);
      }
    });
  }

  finish () {
    if (this.props.ctx.env !== 'SERVER') {
      if (this.state.finished === false && this.track) {
        this.props.app.emit('pageview', {
          ...this.props,
          data: this.state.data,
        });
        this.setState({ finished: true });
      }
    }
  }

  buildTrackingPixelProps(url, props) {
    return {
      url,
      referrer: props.ctx.referrer,
      loid: props.loid,
      loidcreated: props.loidcreated,
      user: props.user,
      compact: props.compact,
      dnt: !!global.DO_NOT_TRACK,
    };
  }

  fireTrackingPixel(url) {
    if (this.props.ctx.env === 'SERVER') {
      return;
    }

    const trackingProps = this.buildTrackingPixelProps(url, this.props);
    const pixel = new TrackingPixel(trackingProps);
    pixel.fire();
  }

  componentDidMount() {
    this.props.app.emit('page:update', this.props);
  }

  componentWillUpdate(nextProps, nextState) {
    nextState.feature = this.state.feature.withContext({
      props: nextProps,
      state: nextState,
    });
  }
}

export default BasePage;
