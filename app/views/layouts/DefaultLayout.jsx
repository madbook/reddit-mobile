/** @jsx React.DOM */

var React = require('react');
var appManifest = require('../../../build/js/app-manifest.json');
var vendorManifest = require('../../../build/js/vendor-manifest.json');

var DefaultLayout = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
        </head>
        <body>
          {this.props.children}
          <script src={"/js/" + appManifest["app.min.js"]}></script>
          <script src={"/js/" + vendorManifest["vendor.min.js"]}></script>
        </body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
