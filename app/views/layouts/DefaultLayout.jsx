/** @jsx React.DOM */

var React = require('react');
var appManifest = require('../../../build/js/app-manifest.json');
var vendorManifest = require('../../../build/js/vendor-manifest.json');
var cssManifest = require('../../../build/css/css-manifest.json');

var LiveReload = require('../components/LiveReload');

var vendorjs = "/js/vendor.js";
var appjs = "/js/app.js";
var appcss = "/css/app.css";

var DefaultLayout = React.createClass({
  render: function() {
    var liveReload;

    if (this.props.liveReload) {
      liveReload = <LiveReload />
    }

    if (this.props.env !== "dev") {
      appjs = appManifest["app.min.js"];
      vendorjs = vendorManifest["vendor.min.js"];
      appcss = cssManifest["app.min.css"];
    }

    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link href={appcss} rel="stylesheet" />
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
