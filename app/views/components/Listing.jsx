/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var Showdown = require('showdown');
var converter = new Showdown.converter();

var Listing = React.createClass({
  render: function() {
    var thumbnail;
    var linkFlair;
    var authorFlair;
    var index;
    var thumbnail;
    var thumbnailCols = 1;
    var selftext;
    var selftextExpando;

    var submitted = moment(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    if (this.props.listing.link_flair_text) {
      linkFlair = <span className={ 'label label-default ' + this.props.listing.link_flair_css_class }>
        { this.props.listing.link_flair_text }
      </span>;
    }

    if (this.props.listing.author_flair_text) {
      authorFlair = (
        <span className={ 'label label-default ' + this.props.listing.author_flair_css_class }>
          { this.props.listing.author_flair_text }
        </span>
      );
    }

    if (this.props.listing.num_comments < 2) {
      comment = 'comment';
    }

    if (this.props.listing.thumbnail) {
      if (this.props.index !== undefined) {
        index = (
          <div className='col-sm-3'>
            <strong className='listing-index'>{ this.props.index + 1 }</strong>
          </div>
        );

        thumbnailCols = 2;
      }

      thumbnail = (
        <div className={ 'col-sm-' + thumbnailCols }>
          <div className='row'>
            {index}

            <div className='col-sm-9'>
              <img src={ this.props.listing.thumbnail } />
            </div>
          </div>
        </div>
      );
    } else {
      thumbnailCols = 0;
    }

    if (this.props.listing.selftext && this.props.expanded) {
      selftext = (
        <div className='panel panel-default selftext'>
          <div className='panel-body' dangerouslySetInnerHTML={{
            __html: converter.makeHtml(this.props.listing.selftext)
          }} />
        </div>
      );
    }

    return (
      <div className='row listing'>
        { thumbnail }

        <article className={ 'col-sm-' + (12 - thumbnailCols) }>
          <header>
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
          </header>

          <div className='listing-footer'>
            <footer>
              <p className='listing-submitted'>
                submitted { submitted.fromNow() } { edited }
                by <a href={ '/u/' + this.props.listing.author }>{ this.props.listing.author }</a> { authorFlair }
                to <a href={ '/r/' + this.props.listing.subreddit }>/r/{ this.props.listing.subreddit }</a>
              </p>
            </footer>

            { selftext }

            <p className='listing-tools'>
              <a href={ this.props.listing.permalink }>{ this.props.listing.num_comments } { comment }</a>
              &nbsp; share save hide report
            </p>
          </div>
        </article>
      </div>
    );
  }
});

module.exports = Listing;
