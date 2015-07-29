import React from 'react';
import _ from 'lodash';
import commentsMap from '../../lib/commentsMap';
import constants from '../../constants';
import globals from '../../globals';
import { models } from 'snoode';
import q from 'q';
import querystring from 'querystring';

import BasePage from './BasePage';
import Comment from '../components/Comment';
import CommentBox from '../components/CommentBox';
import GoogleCarouselMetadata from '../components/GoogleCarouselMetadata';
import Listing from '../components/Listing';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import TrackingPixel from '../components/TrackingPixel';

class ListingPage extends BasePage {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      data: props.data || {},
      linkComment: '',
      editing: false,
      linkEditError: null,
    };

    this.state.loaded = !!(this.state.data && this.state.data.data);
  }

  componentDidMount() {
    super.componentDidMount();

    ListingPage.populateData(globals().api, this.props, true).done((function(data) {
      // Resolved with the same data, return early.
      if (this.state.loaded && data === this.state.data) {
        return;
      }

      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    if (this.props.subredditName) {
      globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'r/' + this.props.subredditName);
    } else {
      globals().app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE);
    }
  }

  onNewComment (comment) {
    this.state.data.data.comments.splice(0, 0, comment);

    this.setState({
      data: this.state.data,
    });
  }

  saveUpdatedText(newText) {
    var props = this.props;
    var listing = this.state.data.data.listing;
    if (newText === listing.selftext) {
      return;
    }

    var link = new models.Link(listing);
    var options = globals().api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      model: link,
      changeSet: newText,
    });

    globals().api.links.patch(options).then(function(res) {
      if (res) {
        var data = this.state.data;
        var listing = data.data.listing;
        var newListing = res.data;
        listing.selftext = newListing.selftext;
        listing.expandContent = newListing.expandContent;

        this.setState({
          editing: false,
          data: data,
        })

        globals().app.emit('post:edit');
      }
    }.bind(this), function(err) {
      this.setState({linkEditError: err});
    }.bind(this))
  }

  onDelete(id) {
    var props = this.props;
    var options = globals().api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      id: id,
    });

    // nothing returned for this endpoint
    // so we assume success :/
    globals().api.links.delete(options).then(function(){
      var data = globals().app.state.data;
      _.remove(data.data, {name: id});
      globals().app.setState({
        data: data,
      })
      globals().app.redirect('/r/' + props.subredditName);
    })
  }

  toggleEdit() {
    this.setState({editing: !this.state.editing});
  }

  render() {
    var loading;
    var tracking;
    var props = this.props;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    }

    var data = this.state.data.data;
    var editing = this.state.editing;
    var listing = data ? data.listing : {};
    var comments = data ? data.comments : [];
    var api = globals().api;
    var user = props.user;
    var token = props.token;
    var author = listing.author;
    var sort = props.sort || 'best';
    var app = globals().app;
    var listingElement;
    var commentBoxElement;
    var apiOptions = props.apiOptions;
    var singleComment;
    var permalink;

    if (listing) {
      permalink = listing.cleanPermalink;
    }

    var keys = [];
    if (global.localStorage) {
      for (var key in localStorage) {
        keys.push(key);
      }
    }
    var savedCommentKeys = keys;
    if (!loading) {
      listingElement = (
        <Listing
          apiOptions={ apiOptions }
          editError={ this.state.linkEditError }
          editing={ editing }
          listing={ listing }
          onDelete={this.onDelete.bind(this, listing.name)}
          user={ user }
          token={ token }
          saveUpdatedText={ this.saveUpdatedText.bind(this) }
          single={ true }
          toggleEdit={ this.toggleEdit.bind(this) }
          />
      );

      commentBoxElement = (
        <CommentBox
          apiOptions={ apiOptions }
          thingId={ listing.name }
          user={ user }
          token={ token }
          csrf={ props.csrf }
          onSubmit={ this.onNewComment.bind(this) }
        />
      );

      if (props.commentId) {
        singleComment = (
          <div className='alert alert-warning vertical-spacing vertical-spacing-top'>
            <p>
              <span>You are viewing a single comment's thread. </span>
              <a href={permalink}>View the rest of the comments</a>
            </p>
          </div>
        );
      }
    }

    if (this.state.data.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ this.state.data.meta.tracking }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
          user={ props.user }
        />);
    }

    return (
      <div className='listing-main'>
        { loading }

        <GoogleCarouselMetadata
          origin={ props.origin }
          show={ props.isGoogleCrawler }
          listing={listing}
          comments={comments}
        />

        <TopSubnav
          user={ user }
          sort={ sort }
          list='comments'
        />
      <div className='container listing-content' key='container'>
          { listingElement }
          { commentBoxElement }
          { singleComment }
          {
            comments.map(function(comment, i) {
              if (comment) {
                comment = commentsMap(comment, null, author, 4, 0, 0, false, savedCommentKeys);
                return (
                  <Comment
                    subredditName={ props.subredditName }
                    permalinkBase={ permalink }
                    highlight={ props.commentId }
                    comment={comment}
                    index={i}
                    key={`page-comment-${comment.name}`}
                    nestingLevel={ 0 }
                    op={ author }
                    user={ user }
                    token={ token }
                    apiOptions={apiOptions}
                  />
                );
              }
            })
          }
        </div>

        { tracking }
      </div>
    );
  }

  static populateData(api, props, synchronous) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve(props.data);
      return defer.promise;
    }

    var options = api.buildOptions(props.apiOptions);

    function mapComment(comment) {
      if (comment && comment.body) {
        comment.body_html = comment.body_html;

        if (comment.replies) {
          comment.replies = comment.replies.map(mapComment) || [];
        }

        return comment;
      }
    }

    options.linkId = props.listingId;

    if (props.commentId) {
      options.query.comment = props.commentId;
      options.query.context = props.query.context || 1;
    }

    options.sort = props.sort || 'confidence';

    // Initialized with data already.
    if (props.data && typeof props.data.data !== 'undefined') {
      api.hydrate('comments', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.comments.get(options).then(function(data){
      data.data.comments = data.data.comments.map(function(comment){
        return mapComment(comment);
      });

      defer.resolve(data);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  }
}

ListingPage.propTypes = {
  // apiOptions: React.PropTypes.object,
  commentId: React.PropTypes.string,
  data: React.PropTypes.object,
  isGoogleCrawler: React.PropTypes.bool,
  listingId: React.PropTypes.string.isRequired,
  origin: React.PropTypes.string.isRequired,
  query: React.PropTypes.object.isRequired,
  sort: React.PropTypes.string,
  subredditName: React.PropTypes.string,
};

export default ListingPage;
