import React from 'react';
import q from 'q';
import commentsMap from '../../lib/commentsMap';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import ListingFactory from '../components/Listing';
var Listing;

import CommentBoxFactory from '../components/CommentBox';
var CommentBox;

import CommentFactory from '../components/Comment';
var Comment;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class ListingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {},
    };

    this.state.loaded = this.state.data && this.state.data.data;
  }

  componentDidMount() {
    ListingPage.populateData(this.props.api, this.props, true).done((function(data) {
      this.setState({
        data: data,
        loaded: true,
      });
    }).bind(this));

    if (this.props.subredditName) {
      this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, 'r/' + this.props.subredditName);
    } else {
      this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE);
    }
  }

  componentDidUpdate() {
    this.props.app.emit('page:update');
  }

  onNewComment (comment) {
    this.state.data.data.comments.splice(0, 0, comment);

    this.setState({
      data: this.props.data,
    });
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

    var listing = data ? data.listing : {};
    var comments = data ? data.comments : [];

    var api = props.api;
    var user = props.user;
    var token = props.token;
    var author = listing.author;
    var sort = props.sort || 'best';
    var app = props.app;

    var listingElement;
    var commentBoxElement;

    var loginPath = props.loginPath;
    var apiOptions = props.apiOptions;

    if (!loading) {
      listingElement = (
        <Listing
          https={ props.https }
          httpsProxy={ props.httpsProxy }
          apiOptions={ apiOptions }
          app={ app }
          listing={ listing }
          single={ true }
          user={ user }
          token={ token }
          api={ api }
          loginPath={ loginPath }
          />
      );

      commentBoxElement = (
        <CommentBox
          apiOptions={ apiOptions }
          thingId={ listing.name }
          user={ user }
          token={ token }
          api={ api }
          csrf={ props.csrf }
          onSubmit={ this.onNewComment.bind(this) }
          loginPath={ loginPath }
        />
      );
    }

    if (this.state.data.meta && props.renderTracking) {
      tracking = (<TrackingPixel url={ this.state.data.meta.tracking } loid={ props.loid } loidcreated={ props.loidcreated } user={ props.user } />);
    }

    return (
      <div className='listing-main'>
        { loading }
        <TopSubnav app={ app } user={ user } sort={ sort } list='comments' baseUrl={ props.url } loginPath={ props.loginPath } />
        <div className='container' key='container'>
          { listingElement }
          { commentBoxElement }
          {
            comments.map(function(comment, i) {
              if (comment) {
                comment = commentsMap(comment, null, author, 4, 0);
                return (
                  <Comment
                    app={app}
                    comment={comment}
                    index={i}
                    key={`page-comment-${comment.name}`}
                    nestingLevel={ 0 }
                    op={ author }
                    user={ user }
                    token={ token }
                    api={api}
                    loginPath={loginPath}
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
      defer.resolve({});
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
    options.sort = props.sort || 'confidence';

    // Initialized with data already.
    if (props.data && typeof props.data.data !== 'undefined') {
      api.hydrate('comments', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.comments.get(options).done(function(data){
      data.data.comments = data.data.comments.map(function(comment){
        return mapComment(comment);
      });

      defer.resolve(data);
    });

    return defer.promise;
  }
}

function ListingPageFactory(app) {
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  Listing = ListingFactory(app);
  Comment = CommentFactory(app);
  CommentBox = CommentBoxFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/listing', ListingPage);
}

export default ListingPageFactory;
