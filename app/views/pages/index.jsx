/** @jsx React.DOM */

var React = require('react');
var Layout = require('../layouts/defaultlayout');
var Listing = require('../components/Listing');

var Index = React.createClass({
  render: function() {
    var lastId;
    var nextButton;

    if (this.props.listings.length) {
      lastId = this.props.listings[this.props.listings.length - 1].name;

      nextButton = (
        <div className='row pageNav'>
          <div className='col-xs-12'>
            <p>
              <a href={ '?count=25&after=' + lastId } className='btn btn-sm btn-primary'>
                Next Page
                <span className='glyphicon glyphicon-chevron-right'></span>
              </a>
            </p>
          </div>
        </div>
      );
    }

    return (
      <Layout title={this.props.title} liveReload={this.props.liveReload} env={this.props.env}>
        {
          this.props.listings.map(function(listing, i) {
            return <Listing listing={listing} index={i} key={'page-listing-' + i} />;
          })
        }

        { nextButton }
      </Layout>
    );
  }
});

module.exports = Index;
