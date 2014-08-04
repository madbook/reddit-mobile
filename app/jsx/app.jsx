/** @jsx React.DOM */

var React = require('react');

var MainSection = require('./components/MainSection.react.jsx');

var App = React.createClass({
  render: function() {
    return (
      <MainSection />
    );
  }
});

module.exports = App;
