/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var process = require('reddit-text-js');
var difference = require('../../client/js/lib/formatDifference').short;
var Vote = require('../components/Vote');

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
  return url.replace(/^https?:\/\/(?:www\.)?reddit.com/, '');
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
    var thumbnail;
    var embedType = 'normal';

    var permalink = mobilify(this.props.listing.permalink);
    var url = mobilify(this.props.listing.url);

    var gilded;

    var distinguished = this.props.listing.distinguished ? ' text-distinguished' : '';

    var titleLink = (
      <a href={ url } className={ distinguished }>
        <h1 className='listing-title'>
            { this.props.listing.title } { edited }
        </h1>
      </a>
    );

    var embedURL = richContent(this.props.listing);
    var embedCardData;

    // If it's not selftext or a normal embed, and it isn't a link to another
    // thing on reddit, embed it as a card.
    if (!this.props.listing.selftext && !embedURL && url == this.props.listing.url) {
      embedType = 'card';
      embedURL = this.props.listing.url;
    }

    var thumbnailSrc = '/img/default.gif';

    var submitted = difference(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    var linkFlairClass = (this.props.listing.link_flair_css_class);
    var authorFlairClass = (this.props.listing.author_flair_css_class);

    var scoreClass = 'up';

    var opClass = this.props.single ? 'label label-primary' : 'text-muted';

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
        <span className='glyphicon glyphicon-gilded' />
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

    thumbnail = (
      <a href={ url }>
        <img src={ thumbnailSrc } className='listing-thumbnail' />
      </a>
    );

    if(embedURL || this.props.listing.selftext) {
      embedFooter = (
        <div className='panel-footer listing-submitted'>
          <ul className='linkbar listing-submitted'>
            <li>
              <a className='text-muted' href={ '/domain/' + this.props.listing.domain }>
                { this.props.listing.domain }
              </a>
            </li>

            <li>
              <a href={ url }>
                Open&nbsp;
                <small className='glyphicon glyphicon-new-window'></small>
              </a>
            </li>

            <li>
              <a href={ permalink }>
                View Comments ({ this.props.listing.num_comments })
              </a>
            </li>
          </ul>

          <a href='javascript:void(0);' data-toggle='collapse' 
            data-target={ '#embed-' + this.props.listing.id } className='pull-right close'>
            <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
          </a>
        </div>
      );

      titleLink = (
        <a href={ url }
           data-toggle='collapse' data-target={ '#embed-' + this.props.listing.id }>
          <h1 className={ 'listing-title' + distinguished }>
            { this.props.listing.title } { edited }
          </h1>
        </a>
      );

      thumbnail = (
        <a href={ url }
           data-toggle='collapse' data-target={ '#embed-' + this.props.listing.id }>

          <img src={ thumbnailSrc } className='listing-thumbnail' />
        </a>
      );

      if (this.props.listing.selftext) {
        embedContents = (
          <div className='panel-body' dangerouslySetInnerHTML={{
            __html: process(this.props.listing.selftext)
          }} />
        );
      } else if (embedURL) {
        embedContents = (
          <div className='panel-body panel-embed'>

            <span className='glyphicon glyphicon-refresh loading'
                data-embed-loading={ 'embed-' + this.props.listing.id } />

            <a href={ embedURL }
               data-embed-type={ embedType }
               id={ 'embed-' + this.props.listing.id }
            />
          </div>
        );
      }
    }

    return (
      <article className='listing'>
        <div className='row vertical-spacing'>
          <div className='col-xs-3 col-sm-2'>
            <div className='listing-comments'>
              { thumbnail }

              <div className='listing-actions'>
                <button className='btn btn-xs btn-block btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown'>
                  <span className='caret'></span>
                </button>
                <ul className='dropdown-menu' role='menu' aria-labelledby='dropdownMenu1'>
                  <li>
                    <a href='#' role='menuitem' tabIndex='-1'>
                      <span className='glyphicon glyphicon-gilded' />
                      gild
                    </a>
                  </li>
                  <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Share</a></li>
                  <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Save</a></li>
                  <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Hide</a></li>
                  <li role='presentation' className='divider'></li>
                  <li role='presentation'><a role='menuitem' tabIndex='-1' href='#'>Report</a></li>
                </ul>
              </div>
            </div>

          </div>

          <div className='col-xs-9 col-sm-10'>
            <header>
              <div className='link-flair-container'>
                { nsfwFlair }
                { linkFlair }
              </div>

              { titleLink }
            </header>

            <div className='listing-footer'>
              <footer>
                <div>
                  { subredditLabel }
                  { domain }
                  { gilded }
                </div>

                <ul className='linkbar listing-submitted'>
                  <li>
                    <Vote thing={ this.props.listing } />
                  </li>

                  <li>
                    <span className='text-muted'>
                      { submitted }
                    </span>
                  </li>

                  <li>
                    <a href={ permalink }>
                      <span className='glyphicon glyphicon-comment'></span>
                      &nbsp;{ this.props.listing.num_comments }
                    </a>
                  </li>
                </ul>

                <div className='listing-submitted'>
                  <span className={ opClass + distinguished }>
                    <a href={ '/u/' + this.props.listing.author }>
                      <span className='glyphicon glyphicon-user'></span>
                      &nbsp;{ this.props.listing.author }
                    </a>
                  </span>

                  { authorFlair }
                </div>
              </footer>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12'>
            <div className='panel panel-default embed collapse out' id={ 'embed-' + this.props.listing.id }>
              { embedContents }
              { embedFooter }
            </div>
          </div>
        </div>
      </article>
    );
  }
});

module.exports = Listing;
