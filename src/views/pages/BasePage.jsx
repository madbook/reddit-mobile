import React from 'react';
import isEqual from 'lodash/lang/isEqual';

import BaseComponent from '../components/BaseComponent';

class BasePage extends BaseComponent {
  constructor (props) {
    super(props);

    this.props = props;
    this.state = {};

    if (props.dataCache) {
      for (var k in props.dataCache) {
        props.data.set(k, Promise.resolve(props.dataCache[k]));
      }

      this.state.data = props.dataCache;
      this.state.loaded = !!props.dataCache;
    }

    for (var key of this.props.data.keys()) {
      if (!props.dataCache[key]) {
        this.watch(key);
      }
    };
  }

  watch (property) {
    this.props.data.get(property).then(function(p) {
      var data = Object.assign({}, this.state.data );
      data[property] = p;

      this.setState({
        data: data,
      });
    }.bind(this));
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
