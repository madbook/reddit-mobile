/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var process = require('reddit-text-js');
var difference = require('../../client/js/lib/formatDifference').short;
var Vote = require('../components/Vote');

function richContent(listing) {
  if (listing.media && listing.media.oembed) {
    return listing.media.oembed.url;
  }

  return listing.url;
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
    var external;
    var thumbnail;
    var embedType = 'normal';
    var embedStateClass = 'out';
    var opClass = 'text-muted';

    var permalink = mobilify(this.props.listing.permalink);
    var url = mobilify(this.props.listing.url);

    var gilded;

    var distinguished = this.props.listing.distinguished ? ' text-distinguished' : '';

    var embedURL = richContent(this.props.listing);

    var thumbnailSrc = '/img/default.gif';

    var submitted = difference(this.props.listing.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    var linkFlairClass = (this.props.listing.link_flair_css_class);
    var authorFlairClass = (this.props.listing.author_flair_css_class);

    var scoreClass = 'up';

    if (this.props.single) {
      opClass = 'label label-primary';

      if (this.props.listing.selftext) {
        embedStateClass = 'in';
      }
    }

    var isSelf = this.props.listing.domain.indexOf('self.') == 0;

    if (!this.props.hideSubredditLabel) {
      subredditLabel = (
        <li>
          <span className='label label-default listing-subreddit'>
            <a href={ '/r/' + this.props.listing.subreddit } className='text-subreddit'>
              /r/{ this.props.listing.subreddit }
            </a>
          </span>
        </li>
      )
    }

    if (!isSelf) {
      domain = (
        <li>
          <a className='text-muted' href={ '/domain/' + this.props.listing.domain }>
            { this.props.listing.domain }
          </a>
        </li>
      );

      external = (
        <li>
          <a className='text-muted' href={ this.props.listing.url }>
            <span className='glyphicon glyphicon-new-window'></span>
          </a>
        </li>
      )
    }

    if (this.props.listing.gilded) {
      gilded = (
        <li><span className='glyphicon glyphicon-gilded' /></li>
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

    var titleLink = (
      <a href={ url } className={ distinguished }>
        <h1 className='listing-title'>
            { this.props.listing.title } { edited }
        </h1>
      </a>
    );

    // If this is a link to reddit and doesn't have selftext, it should
    // behave as a link instead of a card.
    if (!(isSelf && !this.props.listing.selftext)) {
      // Don't bother with an 'open' or 'comments' link for expanded selftext
      if (!(this.props.single && this.props.listing.selftext)) {
        embedFooter = (
          <div className='panel-footer'>
            <ul className='linkbar'>
              <li>
                <a href={ url } className='btn btn-xs btn-link'>
                  <span className='glyphicon glyphicon-new-window'></span> Open Link
                </a>
              </li>
              <li>
                <a href={ permalink } className='btn btn-xs btn-link'>
                  <span className='glyphicon glyphicon-comment'></span> Comments ({ this.props.listing.num_comments })
                </a>
              </li>
            </ul>

            <a href='javascript:void(0);' data-toggle='collapse' 
              data-target={ '#embed-' + this.props.listing.id } className='pull-right close'>
              <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
            </a>
          </div>
        );
      }

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
      } else {
        embedContents = (
          <div className='panel-body panel-embed'>

            <div className='text-center'>
              <span className='glyphicon glyphicon-refresh loading'
                  data-embed-loading={ 'embed-' + this.props.listing.id } />
            </div>

            <a href={ embedURL || this.props.listing.url }
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
                  <ul className='linkbar'>
                    { subredditLabel }
                    { domain }
                  </ul>
                </div>

                <ul className='linkbar vertical-spacing-sm'>
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

                  { gilded }
                  { external }
                </ul>

                <div>
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
            <div className={ 'panel panel-default panel-embed collapse ' + embedStateClass } id={ 'embed-' + this.props.listing.id }>
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
