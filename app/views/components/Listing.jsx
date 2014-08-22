/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var Showdown = require('showdown');
var converter = new Showdown.converter();
var difference = require('../../client/js/lib/formatDifference').short;

var Listing = React.createClass({
  render: function() {
    var thumbnail;
    var linkFlair;
    var authorFlair;
    var selftext;
    var selftextExpando;
    var thumbnailSrc = '/img/default.gif';

    var submitted = difference(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    var linkFlairClass = (this.props.listing.link_flair_css_class);
    var authorFlairClass = (this.props.listing.author_flair_css_class);

    var scoreClass = 'up';

    if (this.props.listing.score < 0) {
      scoreClass = 'down';
    }

    if (this.props.listing.link_flair_text) {
      linkFlair = <p className={ 'listing-link-flair label label-primary ' + linkFlairClass }>
        { this.props.listing.link_flair_text }
      </p>;
    }

    if (this.props.listing.author_flair_text) {
      authorFlair = (
        <span className={ 'listing-author-flair label label-primary ' + authorFlairClass }>
          { this.props.listing.author_flair_text }
        </span>
      );
    }

    if (this.props.listing.num_comments < 2) {
      comment = 'comment';
    }

    if (this.props.listing.thumbnail) {
      if (this.props.listing.thumbnail === 'default' || this.props.listing.thumbnail === 'self') {
        thumbnailSrc = '/img/' + this.props.listing.thumbnail + '.gif';
      } else {
        thumbnailSrc = this.props.listing.thumbnail;
      }
    } else if (this.props.selftext) {
      thumbnailSrc = '/img/self.gif';
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
      <article className='listing row'>
        <div className='col-xs-3'>
          <div className='listing-comments media-object'>
            <a href={ this.props.listing.url }>
              <img src={ thumbnailSrc } className='listing-thumbnail' />
            </a>

            <div className="listing-actions">
              <button className="btn btn-xs btn-block btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Share</a></li>
                <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Save</a></li>
                <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Hide</a></li>
                <li role="presentation" className="divider"></li>
                <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Report</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className='col-xs-9'>
          <header>
            <div className='listing-submitted'>
              <a href={ '/r/' + this.props.listing.subreddit }>
                /r/{ this.props.listing.subreddit }
              </a>
            </div>

            <div className='listing-title'>
              <a href={ this.props.listing.url }>
                <h1>
                  { this.props.listing.title } { edited }
                </h1>
              </a>

              { linkFlair }
            </div>
          </header>

          <div className='listing-footer'>
            <footer>
              <p className='listing-submitted'>
                <span className={ 'text-' + scoreClass + 'vote' }>
                  <span className={ 'glyphicon glyphicon-arrow-' + scoreClass }></span>
                  { this.props.listing.score }
                </span>&nbsp;&middot;&nbsp;

                <span className='glyphicon glyphicon-user'></span>
                &nbsp; { this.props.listing.author }{ authorFlair }&nbsp;&middot;&nbsp;

                { submitted }&nbsp;&middot;

                <a href={ this.props.listing.permalink }>
                  <span className='glyphicon glyphicon-comment'></span>
                  &nbsp;{ this.props.listing.num_comments }
                </a>
              </p>
            </footer>

            { selftext }
          </div>
        </div>
      </article>
    );
  }
});

module.exports = Listing;
