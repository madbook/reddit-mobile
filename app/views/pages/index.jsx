/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/defaultlayout');
var Listing = require('../components/Listing');

var Index = React.createClass({
  render: function() {
    return (
      <Layout title={this.props.title} liveReload={this.props.liveReload} env={this.props.env}>
        {
          this.props.listings.map(function(listing, i) {
            return <Listing listing={listing} index={i} key={'page-listing-' + i} />;
          })
        }
      </Layout>
    );
  }
});

module.exports = Index;
