/** @jsx React.DOM */

var React = require('react');
var Body = require('./Body.react.jsx');

var MainSection = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Example of React with es6 and browserify</h1>
        <Body />
      </div>
    );
  }
});

module.exports = MainSection;
