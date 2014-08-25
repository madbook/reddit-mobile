/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var process = require('reddit-text-js');
var difference = require('../../client/js/lib/formatDifference').short;

var Listing = React.createClass({
  render: function() {
    var thumbnail;
    var linkFlair;
    var authorFlair;
    var selftext;
    var selftextExpandButton;
    var selftextCollapseClass = this.props.expanded ? 'in' : 'out';
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

    if (this.props.listing.selftext) {
      if (!this.props.expanded) {
        selftextExpandButton = (
          <p className='listing-submitted'>
            <a href='javascript:void(0);' className='btn btn-primary btn-xs' data-toggle='collapse' 
                data-target={ '#selftext-' + this.props.listing.id }>
              <span className='glyphicon glyphicon-eye-open'></span> Preview
            </a>
          </p>
        );
      }

      selftext = (
        <div className='col-xs-12'>
          <div className={ 'panel panel-default selftext collapse ' + selftextCollapseClass } id={ 'selftext-' + this.props.listing.id }>
            <div className='panel-body' dangerouslySetInnerHTML={{
              __html: process(this.props.listing.selftext).html
            }} />
          </div>
        </div>
      );
    }

    return (
      <article className='listing row'>
        <div className='col-xs-2 col-sm-1'>
          <div className='listing-comments'>
            <a href={ this.props.listing.url }>
              <img src={ thumbnailSrc } className='listing-thumbnail' />
            </a>

            <div className='listing-actions'>
              <button className='btn btn-xs btn-block btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown'>
                <span className='caret'></span>
              </button>
              <ul className='dropdown-menu' role='menu' aria-labelledby='dropdownMenu1'>
                <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Share</a></li>
                <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Save</a></li>
                <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Hide</a></li>
                <li role='presentation' className='divider'></li>
                <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Report</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className='col-xs-10 col-sm-11'>
          <header>
            <a href={ this.props.listing.url }>
              <h1 className='listing-title'>
                { this.props.listing.title } { edited }
              </h1>
            </a>

            { linkFlair }
          </header>

          <div className='listing-footer'>
            <footer>
              <div className='vertical-spacing-sm'>
                <span className='label label-subreddit'>
                  <a href={ '/r/' + this.props.listing.subreddit } className='text-subreddit'>
                    /r/{ this.props.listing.subreddit }
                  </a>
                </span>
              </div>

              <p className='listing-submitted vertical-spacing'>
                <a href='#'><span className='glyphicon glyphicon-circle-arrow-up'></span></a>&nbsp;
                <span className={ 'text-' + scoreClass + 'vote' }>
                  { this.props.listing.score }&nbsp;
                </span>
                <a href='#'><span className='glyphicon glyphicon-circle-arrow-down'></span></a>

                &nbsp;&middot;

                <a href={ '/u/' + this.props.listing.author } className='text-muted'>
                  <span className='glyphicon glyphicon-user'></span>
                  &nbsp;{ this.props.listing.author }
                </a>

                &nbsp;{ authorFlair }&nbsp;&middot;&nbsp;

                <span className='text-muted'>
                  { submitted }
                </span>&nbsp;&middot;&nbsp;

                <a href={ this.props.listing.permalink }>
                  <span className='glyphicon glyphicon-comment'></span>
                  &nbsp;{ this.props.listing.num_comments }
                </a>

              </p>

              { selftextExpandButton }
            </footer>
          </div>
        </div>

        { selftext }
      </article>
    );
  }
});

module.exports = Listing;
