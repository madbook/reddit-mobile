/** @jsx React.DOM */

var React = require('react');
var appManifest = require('../../../build/js/app-manifest.json');
var vendorManifest = require('../../../build/js/vendor-manifest.json');

var LiveReload = require('../components/LiveReload');

var vendorjs = "/js/vendor.js";
var appjs = "/js/app.js";

var DefaultLayout = React.createClass({
  render: function() {
    var liveReload;

    if (this.props.liveReload) {
      liveReload = <LiveReload />
    }

    if (this.props.env !== "dev") {
      appjs = appManifest["app.min.js"];
      vendorjs = anifest["vendor.min.js"];
    }

    return (
      <html>
        <head>
          <title>{this.props.title}</title>
        </head>
        <body>
          {this.props.children}
          <script src={vendorjs}></script>
          <script src={appjs}></script>
          {liveReload}
        </body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
