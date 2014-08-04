/** @jsx React.DOM */

var React = require('react');

var LiveReload = React.createClass({
  render: function() {
    return (
      <script src="//localhost:35729/livereload.js?snipver=1"></script>
    );
  }
});

module.exports = LiveReload;

