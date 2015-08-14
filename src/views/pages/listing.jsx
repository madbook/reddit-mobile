import React from 'react';
import _ from 'lodash';
import commentsMap from '../../lib/commentsMap';
import constants from '../../constants';
import { models } from 'snoode';

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

    this.state.editing = false;
  }

  onNewComment (comment) {
    // make a shallow copy so we can append to it
    var comments = this.state.data.comments.slice();
    comments.splice(0, 0, comment);

    this.setState({
      data: Object.assign({}, this.state.data, { comments }),
    });
  }

  saveUpdatedText(newText) {
    var props = this.props;
    var listing = this.state.data.listing;

    if (newText === listing.selftext) {
      return;
    }

    var link = new models.Link(listing);
    var options = this.props.app.api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      model: link,
      changeSet: newText,
    });

    this.props.app.api.links.patch(options).then(function(res) {
      if (res) {
        var data = this.state.data;
        var listing = data.listing;
        var newListing = res;

        listing.selftext = newListing.selftext;
        listing.expandContent = newListing.expandContent;

        this.setState({
          editing: false,
          data: data,
        })

        this.props.app.emit('post:edit');
      }
    }.bind(this), function(err) {
      this.setState({ linkEditError: err });
    }.bind(this))
  }

  onDelete(id) {
    var props = this.props;
    var options = this.props.app.api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      id: id,
    });

    // nothing returned for this endpoint
    // so we assume success :/
    this.props.app.api.links.delete(options).then(function(){
      var data = this.state.data.listing;
      _.remove(data, {name: id});

      this.props.app.setState({
        data: data,
      })

      this.props.app.redirect('/r/' + props.subredditName);
    }.bind(this))
  }

  toggleEdit() {
    this.setState({
      editing: !this.state.editing
    });
  }

  render() {
    var loading;
    var tracking;
    var props = this.props;

    if (!this.state.data || !this.state.data.listing) {
      return (<Loading />);
    }

    var editing = this.state.editing;

    var listing = this.state.data.listing;

    var api = this.props.app.api;
    var user = this.state.data.user;
    var token = props.token;
    var author = listing.author;
    var sort = props.sort || 'best';
    var app = this.props.app;
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
          app={ props.app }
          ctx={ props.ctx }
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
          app={ props.app }
          ctx={ props.ctx }
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

    if (this.state.data.comments && this.state.data.comments.meta) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ this.state.data.comments.meta.tracking }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
          user={ props.user }
        />);
    }

    let commentsList = [];

    var comments = this.state.data.comments;
    if (comments) {
      commentsList = comments.map(function(comment, i) {
        if (comment) {
          comment = commentsMap(comment, null, author, 4, 0, 0, false, savedCommentKeys);
          return (
            <Comment
              ctx={ props.ctx }
              app={ props.app }
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
        });
    } else {
      commentsList = (
        <div className='Loading-Container'>
          <Loading />
        </div>
      );
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
          { ...props }
          user={ this.state.data.user }
          sort={ sort }
          list='comments'
        />

        <div className='container listing-content' key='container'>
          { listingElement }
          { commentBoxElement }
          { singleComment }
          { commentsList }
        </div>

        { tracking }
      </div>
    );
  }
}

ListingPage.propTypes = {
  commentId: React.PropTypes.string,
  data: React.PropTypes.object,
  isGoogleCrawler: React.PropTypes.bool,
  listingId: React.PropTypes.string.isRequired,
  sort: React.PropTypes.string,
  subredditName: React.PropTypes.string,
};

export default ListingPage;
