/** @jsx React.DOM */

var React = require('react');

var Listing = React.createClass({
  render: function() {
    return (
      <div className='row'>
        <div className='col-sm-1'>
          {this.props.index}
        </div>
        <div className='col-sm-1'>
          {this.props.listing.score}
        </div>
        <div className='col-sm-1'>
          <img src={this.props.listing.thumbnail} />
        </div>
        <div className='col-sm-9'>
          <a href={this.props.listing.url}>
            {this.props.listing.title}
          </a>
      </div>
      </div>
    );
  }
});

module.exports = Listing;
