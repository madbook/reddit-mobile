/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var process = require('reddit-text-js');
var difference = require('../../client/js/lib/formatDifference').short;

var imgRegex = /\.(?:gif|jpe?g|png)(?:\?.*)?$/;
var videoRegex = /^https?:\/\/.*youtube|vimeo|ustream|qik\..+\/.*./;

function richContent(listing) {
  if (listing.media && listing.media.oembed) {
    return listing.media.oembed.url;
  }

  if (imgRegex.test(listing.url)) {
    return listing.url;
  }
}

function mobilify(url) {
  return url.replace(/^https?:\/\/(?:www\.)reddit.com?/, '');
}

var Listing = React.createClass({
  render: function() {
    var thumbnail;
    var linkFlair;
    var nsfwFlair;
    var authorFlair;
    var embedContainer;
    var embedContent;
    var embedContents;
    var embedFooter;
    var subredditLabel;
    var domain;
    var permalink = mobilify(this.props.listing.permalink);
    var url = mobilify(this.props.listing.url);

    var external;
    var gilded;

    var distinguished = this.props.listing.distinguished ? ' text-distinguished' : '';

    var titleLink = (
      <h1 className='listing-title'>
        <a href={ url } className={ distinguished }>
          { this.props.listing.title } { edited }
        </a>
      </h1>
    );

    var embedURL = richContent(this.props.listing);
    var embedCollapseClass = this.props.expanded ? 'in' : 'out';
    var thumbnailSrc = '/img/default.gif';

    var submitted = difference(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    var linkFlairClass = (this.props.listing.link_flair_css_class);
    var authorFlairClass = (this.props.listing.author_flair_css_class);

    var scoreClass = 'up';

    if (!this.props.hideSubredditLabel) {
      subredditLabel = (
        <span className='label label-default listing-subreddit'>
          <a href={ '/r/' + this.props.listing.subreddit } className='text-subreddit'>
            /r/{ this.props.listing.subreddit }
          </a>
        </span>
      )
    }

    if (this.props.listing.domain.indexOf('self.') != 0) {
      domain = (
        <small className='text-muted listing-submitted listing-domain'>
          <a className='text-muted' href={ '/domain/' + this.props.listing.domain }>
            { this.props.listing.domain }
          </a>
        </small>
      );
    }

    if (this.props.listing.gilded) {
      gilded = (
        <span className='glyphicons glyphicons-gilded' />
      );
    }

    if (this.props.listing.score < 0) {
      scoreClass = 'down';
    }

    if (this.props.listing.link_flair_text) {
      linkFlair = (
        <span className={ 'listing-link-flair label label-primary ' + linkFlairClass }>
          { this.props.listing.link_flair_text }
        </span>
      );
    }

    if (this.props.listing.title.match(/nsf[wl]/gi) || this.props.listing.over_18) {
      nsfwFlair = (
        <span className='listing-link-flair label label-danger'>
          NSFW
        </span>
      );
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
    } else if (this.props.embed) {
      thumbnailSrc = '/img/self.gif';
    }

    if (this.props.listing.embed || this.props.listing.selftext || embedURL) {
      if (!this.props.expanded) {
        titleLink = (
          <a href={ url }
             data-toggle='collapse' data-target={ '#embed-' + this.props.listing.id }>
            <h1 className={ 'listing-title' + distinguished }>
              { this.props.listing.title } { edited }
            </h1>
          </a>
        );
      }

      embedFooter = (
        <div className='panel-footer listing-submitted'>
          <a className='text-muted' href={ '/domain/' + this.props.listing.domain }>
            { this.props.listing.domain }
          </a>&nbsp;&middot;&nbsp;

          <a href={ url }>
            Open&nbsp;
            <small className='glyphicon glyphicon-new-window'></small>
          </a>&nbsp;&middot;&nbsp;

          <a href={ permalink } target='_blank'>
            View Comments ({ this.props.listing.num_comments })
          </a>

          <a href='javascript:void(0);' data-toggle='collapse' 
            data-target={ '#embed-' + this.props.listing.id } className='pull-right close'>
            <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
          </a>
        </div>
      );

      if (this.props.listing.embed) {
        embedContents = (
          <div className='panel-body' dangerouslySetInnerHTML={{
            __html: process(this.props.listing.embed).html
          }} />
        );
      } else if (embedURL) {
        embedContents = (
          <div className='panel-body panel-embed'>
            <a href={ embedURL } data-embed={ embedURL } />
          </div>
        );
      } else if (this.props.listing.selftext) {
        embedContents = (
          <div className='panel-body' dangerouslySetInnerHTML={{
            __html: process(this.props.listing.selftext).html
          }} />
        );
      }

      embedContainer = (
        <div className='col-xs-12'>
          <div className={ 'panel panel-default embed collapse ' + embedCollapseClass } id={ 'embed-' + this.props.listing.id }>
            { embedContents }
            { embedFooter }
          </div>
        </div>
      );
    } else if (url.indexOf('/') != 0) {
      external = (
        <small className='glyphicon glyphicon-new-window text-muted listing-external' />
      );
    }

    return (
      <article className='listing row'>
        <div className='col-xs-2 col-sm-1'>
          <div className='listing-comments'>
            <a href={ url }>
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
            <div className='link-flair-container'>
              { nsfwFlair }
              { linkFlair }
            </div>

            { titleLink }
          </header>

          <div className='listing-footer'>
            <footer>
              <div className='vertical-spacing-sm'>
                { subredditLabel }
                { domain }
                { external }
                { gilded }
              </div>

              <p className='listing-submitted vertical-spacing'>
                <a href='#'><span className='glyphicon glyphicon-circle-arrow-up'></span></a>&nbsp;
                <span className={ 'text-' + scoreClass + 'vote' }>
                  { this.props.listing.score }&nbsp;
                </span>
                <a href='#'><span className='glyphicon glyphicon-circle-arrow-down'></span></a>

                &nbsp;&middot;&nbsp;

                <span className='text-muted'>
                  { submitted }
                </span>&nbsp;&middot;

                <a href={ '/u/' + this.props.listing.author } className={ 'text-muted' + distinguished }>
                  <span className='glyphicon glyphicon-user'></span>
                  &nbsp;{ this.props.listing.author }
                </a>

                &nbsp;{ authorFlair }&nbsp;&middot;&nbsp;

                <a href={ permalink }>
                  <span className='glyphicon glyphicon-comment'></span>
                  &nbsp;{ this.props.listing.num_comments }
                </a>
              </p>
            </footer>
          </div>
        </div>

        { embedContainer }
      </article>
    );
  }
});

module.exports = Listing;
