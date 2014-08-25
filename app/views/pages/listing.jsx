/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/defaultlayout');
var Listing = require('../components/Listing');
var Comment = require('../components/Comment');

var ListingPage = React.createClass({
  render: function() {
    return (
      <Layout title={this.props.title} liveReload={this.props.liveReload} env={this.props.env}>
        <Listing listing={this.props.listing} expanded={ true } />
        {
          this.props.comments.map(function(comment, i) {
            if (comment) {
              return <Comment comment={comment} index={i} key={'page-comment-' + i} nestingLevel={0} />;
            }
          })
        }
      </Layout>
    );
  }
});

module.exports = ListingPage;
