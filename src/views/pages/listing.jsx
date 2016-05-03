import React from 'react';
import remove from 'lodash/array/remove';
import { models } from '@r/api-client';

import constants from '../../constants';
import { SORTS } from '../../sortValues';
import BasePage from './BasePage';
import LinkTools from '../components/LinkTools';
import Comment from '../components/comment/Comment';
import GoogleCarouselMetadata from '../components/GoogleCarouselMetadata';
import Post from '../components/listings/Post';
import Loading from '../components/Loading';
import TopSubnav from '../components/TopSubnav';
import RelevantContent from '../components/listings/RelevantContent';

const T = React.PropTypes;

function limitTrees(limit, trees) {
  if (limit === 0 || !trees || trees.length === 0) {
    return [0, []];
  }
  const first = trees[0];
  const rest = trees.slice(1);
  const [count, pruned] = limitTree(limit, first);
  if (limit > count) {
    const [restCount, restPruned] = limitTrees(limit - count, rest);
    return [count + restCount, [pruned].concat(restPruned)];
  }
  return [count, [pruned]];
}

function limitTree(limit, tree) {
  if (limit === 0) {
    return [0, null];
  } else if (limit === 1) {
    return [1, { ...tree, replies: [] }];
  }
  const [count, children] = limitTrees(limit - 1, tree.replies);
  return [count + 1, { ...tree, replies: children }];
}


class ListingPage extends BasePage {
  static propTypes = {
    commentId: T.string,
    data: T.object,
    listingId: T.string.isRequired,
    loid: T.string.isRequired,
    loidcreated: T.string.isRequired,
    sort: T.string,
    subredditName: T.string,
  };

  static buildMeta = (listing) => {
    return `${listing.title} | r/${listing.subreddit} at reddit.com`;
  }

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      editing: false,
      loadingMoreComments: false,
      expandComments: false,
    };

    this.onNewComment = this.onNewComment.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveUpdatedText = this.saveUpdatedText.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.expandComments = this.expandComments.bind(this);
  }

  get track () {
    return 'comments';
  }

  onNewComment (comment) {
    // make a shallow copy so we can append to it
    const comments = this.state.data.comments.slice();
    comments.splice(0, 0, comment);

    this.setState({
      data: Object.assign({}, this.state.data, { comments }),
    });
  }

  saveUpdatedText(newText) {
    const {app, apiOptions} = this.props;
    const listing = this.state.data.listing;

    if (newText === listing.selftext) {
      return;
    }

    const link = new models.Link(listing);
    let options = app.api.buildOptions(apiOptions);

    options = Object.assign(options, {
      model: link,
      changeSet: newText,
    });

    app.api.links.patch(options).then((newListing) => {
      if (newListing) {
        const data = Object.assign({}, this.state.data);
        data.listing = newListing;

        this.setState({
          editing: false,
          data,
        });

        app.emit('post:edit');
      }
    }).catch((err) => {
      this.setState({ linkEditError: err });
    });
  }

  onDelete(id) {
    const { app, subredditName, apiOptions } = this.props;
    let options = app.api.buildOptions(apiOptions);

    options = Object.assign(options, {
      id,
    });

    // nothing returned for this endpoint
    // so we assume success :/
    app.api.links.delete(options).then(() => {
      const data = this.state.data.listing;
      remove(data, {name: id});

      app.setState({
        data,
      });

      app.redirect(`/r/${subredditName}`);
    });
  }

  toggleEdit() {
    this.setState({
      editing: !this.state.editing,
    });
  }

  handleSortChange(newSort) {
    const newUrl = `${this.props.ctx.url}?sort=${newSort}`;
    this.props.app.redirect(newUrl);
  }

  async loadMore(e) {
    e.preventDefault();
    const { app, apiOptions, sort } = this.props;
    const { data } = this.state;

    const index = e.currentTarget.dataset.index;
    const comment = data.comments[index];

    let options = app.api.buildOptions(apiOptions);
    options = Object.assign(options, {
      query: {
        ids: comment.children,
      },
      linkId: data.listing.name,
      sort: sort || SORTS.HOT,
    });

    this.setState({ loadingMoreComments: true });

    try {
      const res = await app.api.comments.get(options);
      const newData = Object.assign({}, data);
      newData.comments = data.comments
        .slice(0, data.comments.length - 1)
        .concat(res.body);

      this.setState({
        data: newData,
        loadingMoreComments: false,
      });

    } catch (e) {
      app.error(e, this, app, { redirect: false, replaceBody: false });
      this.setState({loadingMoreComments: false});
    }
  }

  expandComments() {
    this.setState({ expandComments: true });
  }

  render() {
    const { data, editing, loadingMoreComments, linkEditError, expandComments } = this.state;

    const {
      app,
      apiOptions,
      commentId,
      ctx,
      token,
      subredditName,
      listingId,
      loid,
      loidcreated,
    } = this.props;

    const sort = this.props.sort || SORTS.CONFIDENCE;

    const { origin } = this.props.config;
    const { url, env } = ctx;

    if (!data || !data.listing) {
      return (<Loading />);
    }

    const { user, listing, comments, relevant, subreddit } = data;
    const { author, permalink, is_self: isSelfText } = listing;

    app.emit('setTitle', { title: listing.title });

    let singleComment;
    if (commentId) {
      singleComment = (
        <div className='alert alert-warning vertical-spacing vertical-spacing-top'>
          <p>
            <span>You are viewing a single comment's thread. </span>
            <a href={ permalink }>View the rest of the comments</a>
          </p>
        </div>
      );
    }

    let commentsList;
    let googleCarousel;

    const abbreviateComments =
      !expandComments &&
      (this.state.feature.enabled(constants.flags.VARIANT_RELEVANCY_TOP) ||
       this.state.feature.enabled(constants.flags.VARIANT_RELEVANCY_RELATED) ||
       this.state.feature.enabled(constants.flags.VARIANT_RELEVANCY_ENGAGING));

    /*
      comments can be in one of three states:
        1) it is an array of comments
        2) it is an object with other data in it
        3) it is not defined

      In case 1, we can go ahead and map over the list to draw any comments
      that might be there.

      For case 2, this usually happens when there are 0 comments or there was
      an error in fetching comments. In this case, we don't want to render
      anything.

      For case 3, this means that comments have not loaded yet, and we should
      draw a loading state.
    */
    if (Array.isArray(comments)) {
      let commentsTrees = comments;

      if (abbreviateComments) {
        [, commentsTrees] = limitTrees(3, comments);
      }

      commentsList = commentsTrees.map((comment, i) => {
        const key = `comment-${i}-${abbreviateComments}`;

        if (comment && comment.body_html !== undefined) {
          return (
            <div className='listing-comment' key={ comment.id } >
              <Comment
                postCreated={ listing.created }
                ctx={ ctx }
                app={ app }
                subredditName={ subredditName }
                permalinkBase={ permalink }
                highlightedComment={ commentId }
                comment={ comment }
                index={ i }
                nestingLevel={ 0 }
                op={ author }
                user={ user }
                token={ token }
                apiOptions={ apiOptions }
                sort={ sort }
                repliesLocked={ listing.locked }
              />
            </div>
          );
        }

        const numChildren = comment.children.length;
        const word = numChildren > 1 ? 'replies' : 'reply';
        const contextPermalink = `${permalink}${comment.parent_id.substring(3)}?context=0`;
        const text = loadingMoreComments ? 'Loading...' :
                                         `load more comments (${numChildren} ${word})`;

        return (
          <a
            key={ key }
            href={ contextPermalink }
            data-no-route='true'
            data-index={ i }
            onClick={ this.loadMore }
          >{ text }</a>
        );
      });

      if (abbreviateComments) {
        commentsList = [commentsList,
          <a
            className='listing-comment-collapsed-more'
            onClick={ this.expandComments }
            href='#'
            key='comment-collapsed-more'
          >
            Read More
          </a>,
        ];
      }

      // Show google crawler metadata when the server renders
      if (env === 'SERVER') {
        googleCarousel = (
          <GoogleCarouselMetadata
            nonce={ this.props.ctx.csrf }
            url={ url }
            app={ app }
            origin={ origin }
            listing={ listing }
            comments={ comments }
          />
        );
      }
    } else if (!comments) {
      commentsList = (
        <div className='Loading-Container'>
          <Loading />
        </div>
      );
    }

    let relevantContent;
    if (relevant) {
      relevantContent = (
        <RelevantContent
          feature={ this.state.feature }
          relevant={ relevant }
          width={ constants.POST_DEFAULT_WIDTH }
          subredditName={ subredditName }
          subreddit={ subreddit }
          listingId={ listingId }
          isSelfText={ isSelfText }
          app={ app }
          loid={ loid }
          loidcreated={ loidcreated }
        />
      );
    } else {
      relevantContent = (
        <div className='Loading-Container'>
          <Loading />
        </div>
      );
    }

    return (
      <div className='listing-main'>
        <TopSubnav
          { ...this.props }
          user={ user }
          sort={ sort }
          list='comments'
          hideSort={ true }
        />
        <div className='listing-content' key='container'>
          { googleCarousel }
          <Post
            feature={ this.state.feature }
            compact={ false }
            app={ app }
            ctx={ ctx }
            apiOptions={ apiOptions }
            editError={ linkEditError }
            editing={ editing }
            post={ listing }
            onDelete={ this.onDelete }
            user={ user }
            token={ token }
            saveUpdatedText={ this.saveUpdatedText }
            single={ true }
            winWidth={ constants.POST_DEFAULT_WIDTH }
            toggleEdit={ this.toggleEdit }
          />
          <div className='container'>
            <div className="listing-content__tools">
              <LinkTools
                ctx={ ctx }
                userId={ user }
                app={ app }
                apiOptions={ apiOptions }
                token={ token }
                linkId={ listing.name }
                isLocked={ listing.locked }
                sort={ sort }
                onNewComment={ this.onNewComment }
                onSortChange={ this.handleSortChange }
              />
            </div>
            { singleComment }
            { commentsList }
          </div>
          { relevantContent }
        </div>
      </div>
    );
  }
}

export default ListingPage;
