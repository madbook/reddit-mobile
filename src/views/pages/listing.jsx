import React from 'react';

import q from 'q';

import commentsMap from '../../lib/commentsMap';

import LoadingFactory from '../components/Loading';
var Loading;

import ListingFactory from '../components/Listing';
var Listing;

import CommentBoxFactory from '../components/CommentBox';
var CommentBox;

import CommentFactory from '../components/Comment';
var Comment;

import TopNavFactory from '../components/TopNav';
var TopNav;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class ListingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: props.comments,
      listing: props.listing,
    };
  }

  componentDidMount () {
    ListingPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        listing: data.listing,
        comments: data.comments,
      });
    }).bind(this));

    this.props.app.emit(TopNav.SUBREDDIT_NAME, this.props.subredditName);
  }

  onNewComment (comment) {
    this.state.comments.splice(0, 0, comment);
    this.setState({ comments: this.props.comments });
  }

  render () {
    var loading;

    if (this.state.listing === undefined) {
      loading = (
        <Loading />
      );
    }

    var listing = this.state.listing || {};
    var comments = this.state.comments || [];
    var session = this.props.session;
    var api = this.props.api;

    var author = listing.author;
    var listingElement;
    var commentBoxElement;
    var commentHeader;

    var sort = this.props.sort || 'best';

    if (!loading) {
      listingElement = (
        <Listing listing={listing} single={ true } session={ session } api={api} expanded={ true } />
      );

      commentHeader = (
        <div className='comments-header'>
          <div className='text-center'>
            <span className='glyphicon glyphicon-align-justify text-muted'></span>
          </div>
          <div className='text-center'>
            <ul className='linkbar'>
              <li>
                { comments.length } comments
              </li>
              <li>
                <a href={ listing.url } target='_blank'>open in tab</a>
              </li>
            </ul>
          </div>
        </div>
      );

      commentBoxElement = (
        <CommentBox thingId={ listing.name } session={ session } api={ api } csrf={ this.props.csrf } onSubmit={ this.onNewComment }  />
      );
    }

    return (
      <main>

        { loading }
        <TopSubnav sort={ sort } list='comments' baseUrl={ this.props.url }/>
        <div className='container' key='container'>
          { listingElement }
          { commentHeader }
          { commentBoxElement }
          {
            comments.map(function(comment, i) {
              if (comment) {
                comment = commentsMap(comment, null, author, 4, 0);
                return <Comment comment={comment} index={i} key={'page-comment-' + comment.name} nestingLevel={ 0 } op={ author } session={ session } api={api} />;
              }
            })
          }
        </div>
      </main>
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    var auth;

    if (props && props.session && props.session.token) {
      auth = props.session.token.access_token;
    }

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve();
      return defer.promise;
    }

    var options = api.buildOptions(auth);

    function decodeHtmlEntities(html){
      return html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }

    function mapComment(comment) {
      if (comment && comment.body) {
        comment.body_html = decodeHtmlEntities(comment.body_html);

        if (comment.replies){
          comment.replies = comment.replies.map(mapComment) || [];
        }

        return comment;
      }
    }

    options.linkId = props.listingId;
    options.sort = props.sort || 'confidence';

    // Initialized with data already.
    if (typeof props.comments !== 'undefined') {
      api.hydrate('comments', options, {
        listing: props.listings,
        comments: props.comments,
      });

      defer.resolve(props);
      return defer.promise;
    }


    api.comments.get(options).done(function(data){
      data.comments = data.comments.map(function(comment){
        return mapComment(comment);
      });

      defer.resolve(data);
    });

    return defer.promise;
  }
};

function ListingPageFactory(app) {
  Loading = LoadingFactory(app);
  Listing = ListingFactory(app);
  Comment = CommentFactory(app);
  CommentBox = CommentBoxFactory(app);
  TopNav = TopNavFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/listing', ListingPage);
}

export default ListingPageFactory;
