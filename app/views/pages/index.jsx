/** @jsx React.DOM */

var React = require('react');

var Index = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

module.exports = Index;
