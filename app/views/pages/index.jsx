/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/defaultlayout');

var Index = React.createClass({
  render: function() {
    return (
      <Layout title={this.props.title}>
        <div>Hello {this.props.name}</div>
      </Layout>
    );
  }
});

module.exports = Index;
