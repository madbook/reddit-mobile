/** @jsx React.DOM */

var React = require('react');
var appManifest = require('../../../build/js/app-manifest.json');
var vendorManifest = require('../../../build/js/vendor-manifest.json');
var cssManifest = require('../../../build/css/css-manifest.json');

var LiveReload = require('../components/LiveReload');
var NavBar = require('../components/NavBar');
var Footer = require('../components/Footer');

var vendorjs = 'vendor.js';
var appjs = 'app.js';
var basecss = 'base.css';
var fancycss = 'fancy.css';

var DefaultLayout = React.createClass({
  render: function() {
    var liveReload;

    if (this.props.liveReload) {
      liveReload = <LiveReload />
    }

    if (this.props.env !== 'development') {
      appjs = appManifest['app.min.js'];
      vendorjs = vendorManifest['vendor.min.js'];
      basecss = cssManifest['base.css'];
      fancycss = cssManifest['fancy.css'];
    }

    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link href={'/css/' + basecss} rel='stylesheet' />
          <link href={'/css/' + fancycss} rel='stylesheet' media='screen' />
          <meta name='viewport' content='width=device-width, user-scalable=no' />
          <meta id='csrf-token-meta-tag' name='csrf-token' content={this.props.csrf} />
        </head>
        <body>
          <NavBar session={this.props.session} />

          <main className='container'>
            {this.props.children}
          </main>

          <Footer />

          <script src={'/js/' + vendorjs}></script>
          <script src={'/js/' + appjs}></script>
          {liveReload}
        </body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
