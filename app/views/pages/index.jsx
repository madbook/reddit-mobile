/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/DefaultLayout');
var Listing = require('../components/Listing');

var Index = React.createClass({
  render: function() {
    var firstId;
    var lastId;
    var prevButton;
    var nextButton;
    var page = this.props.page;

    if (this.props.listings.length) {
      firstId = this.props.listings[0].name;
      lastId = this.props.listings[this.props.listings.length - 1].name;
      hideSubredditLabel = this.props.hideSubredditLabel;

      if (page > 0) {
        prevButton = (
          <a href={ '?count=25&page=' + (page - 1) + '&before=' + firstId } className='btn btn-sm btn-primary'>
            <span className='glyphicon glyphicon-chevron-left'></span>
            Previous Page
          </a>
        );
      }

      nextButton = (
        <a href={ '?count=25&page=' + (page + 1) + '&after=' + lastId } className='btn btn-sm btn-primary'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    return (
      <Layout title={this.props.title} liveReload={this.props.liveReload} env={this.props.env} session={this.props.session} csrf={this.props.csrf}>
        {
          this.props.listings.map(function(listing, i) {
            if (listing.hidden) { 
              return;
            }

            var index = (page * 25) + i;
            return <Listing listing={listing} index={index} key={'page-listing-' + index} page={ page } hideSubredditLabel={ hideSubredditLabel } />;
          })
        }
        <div className='row pageNav'>
          <div className='col-xs-12'>
            <p>
              { prevButton } { nextButton }
            </p>
          </div>
        </div>
      </Layout>
    );
  }
});

module.exports = Index;
