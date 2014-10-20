/** @jsx React.DOM */

import * as React from 'react';

var LiveReload = React.createClass({
  render: function() {
    return (
      <script src="//localhost:35729/livereload.js?snipver=1"></script>
    );
  }
});

export default LiveReload;
