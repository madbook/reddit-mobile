/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/DefaultLayout');
var Listing = require('../components/Listing');
var Comment = require('../components/Comment');
var commentsMap = require('../../client/js/lib/commentsMap');

var ListingPage = React.createClass({
  render: function() {
    var listing = this.props.listing;

    return (
      <Layout title={this.props.title} liveReload={this.props.liveReload} env={this.props.env} session={this.props.session} csrf={this.props.csrf}>
        <Listing listing={this.props.listing} single={ true } />
        {
          this.props.comments.map(function(comment, i) {
            if (comment) {
              comment = commentsMap(comment, null, listing.author, 4, 0);
              return <Comment comment={comment} index={i} key={'page-comment-' + i} nestingLevel={0} op={listing.author} />;
            }
          })
        }
      </Layout>
    );
  }
});

module.exports = ListingPage;
