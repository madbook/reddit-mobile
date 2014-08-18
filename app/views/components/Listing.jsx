/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');

var Listing = React.createClass({
  render: function() {
    var thumbnail;
    var linkFlair;
    var authorFlair;

    var submitted = moment(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    if (this.props.listing.thumbnail) {
      thumbnail = (
        <div className='col-sm-9'>
          <img src={ this.props.listing.thumbnail } />
        </div>
      );
    }

    if (this.props.listing.link_flair_text) {
      linkFlair = <span className={ 'label label-default ' + this.props.listing.link_flair_css_class }>
        { this.props.listing.link_flair_text }
      </span>;
    }

    if (this.props.listing.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + this.props.listing.author_flair_cssclass }>
        { this.props.listing.author_flair }
      </span>;
    }

    if (this.props.listing.num_comments < 2) {
      comment = 'comment';
    }

    return (
      <div className='row listing'>
        <div className='col-sm-2'>
          <div className='row'>
            <div className='col-sm-3'>
              <strong className='listing-index'>{ this.props.index + 1 }</strong>
            </div>

            { thumbnail }
          </div>
        </div>

        <article className='col-sm-10'>
          <h1 className='listing-title'>
            <a href={ this.props.listing.url }>
              { this.props.listing.title }
            </a>
            { linkFlair }
            &nbsp;
            <a href={ '/domains/' + this.props.listing.domain }>
              <small>
                ({ this.props.listing.domain })
              </small>
            </a>
          </h1>

          <footer className='listing-footer'>
            <p className='listing-submitted'>
              submitted { submitted.fromNow() } { edited }
              by <a href={ '/u/' + this.props.listing.author }>{ this.props.listing.author }</a>
              to <a href={ '/r/' + this.props.listing.subreddit }>/r/{ this.props.listing.subreddit }</a>
            </p>

            <p className='listing-tools'>
              <a href={ this.props.listing.permalink }>{ this.props.listing.num_comments } { comment }</a>
              &nbsp; share save hide report
            </p>
          </footer>
        </article>
      </div>
    );
  }
});

module.exports = Listing;
