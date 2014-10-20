/** @jsx React.DOM */

import * as React from 'react';

import commentsMap from '../../client/js/lib/commentsMap';

import Layout from '../layouts/DefaultLayout';
import Listing from '../components/Listing';
import Comment from '../components/Comment';

var ListingPage = React.createClass({
  render: function() {
    var listing = this.props.listing;

    return (
      <Layout title={this.props.listing.title} liveReload={this.props.liveReload} env={this.props.env} session={this.props.session} csrf={this.props.csrf}>
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

export default ListingPage;
