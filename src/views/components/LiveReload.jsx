import React from 'react';

import BaseComponent from './BaseComponent';

class LiveReload extends BaseComponent {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  render () {
    return (
      <script src="//localhost:35729/livereload.js?snipver=1"></script>
    );
  }
}

export default LiveReload;
