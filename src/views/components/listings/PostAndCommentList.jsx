import React from 'react';

import constants from '../../../constants';
import isFakeSubreddit from '../../../lib/isFakeSubreddit';
import propTypes from '../../../propTypes';

import BaseComponent from '../BaseComponent';
import Post from './Post';
import Ad from '../Ad';
import CommentPreview from '../CommentPreview';

const T = React.PropTypes;

const _AD_LOCATION = 11;
const _DEFAULT_PAGE_SIZE = 25;
const _FRONTPAGE_NAME = ' reddit.com';

export default class PostAndCommentList extends BaseComponent {
  static propTypes = {
    postsAndComments: propTypes.postsAndComments.isRequired,
    app: T.object.isRequired,
    config: T.object, // required if showAds === true
    ctx: T.object.isRequired,
    user: propTypes.user,
    apiOptions: T.object.isRequired,
    compact: T.bool.isRequired,
    winWidth: T.number,
    firstPage: T.number,
    showAds: T.bool,
    loid: T.string,
    showHidden: T.bool,
    hideSubredditLabel: T.bool,
    subredditName: T.string,
    subredditTitle: T.string,
    subredditIsNSFW: T.bool,
    showOver18Interstitial: T.bool,
    className: T.string,
  };

  static defaultProps = {
    firstPage: 0,
    winWidth: constants.POST_DEFAULT_WIDTH,
    className: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      adLocation: Math.min(_AD_LOCATION, props.postsAndComments.length),
      compact: this.props.compact,
    };

    this.hasListeners = false;


    this.lazyLoad = this.lazyLoad.bind(this);
    this.afterAdDidLoad = this.afterAdDidLoad.bind(this);
  }

  getSite() {
    let site = _FRONTPAGE_NAME;

    if (this.props.multi) {
      site = `/user/${this.props.multiUser}/m/${this.props.multi}`;
    } else if (this.props.subredditName &&
        !isFakeSubreddit(this.props.subredditName)) {
      site = this.props.subredditName;
    }

    return site;
  }

  componentWillReceiveProps(nextProps) {
    const compact = nextProps.compact;
    if (compact !== 'undefined' && compact !== this.state.compact) {
      this.setState({compact});
    }
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    if (!this.hasListeners) {
      this.hasListeners = true;
      this.props.app.on(constants.SCROLL, this.lazyLoad);
      this.props.app.on(constants.RESIZE, this.lazyLoad);
      this.lazyLoad();
    }
  }

  removeListeners() {
    if (this.hasListeners) {
      this.hasListeners = false;
      this.props.app.off(constants.SCROLL, this.lazyLoad);
      this.props.app.off(constants.RESIZE, this.lazyLoad);
    }
  }

  hasAd() {
    return this.props.showAds && this.refs.ad;
  }

  isIndexOfAd(index) {
    return index === this.state.adLocation;
  }

  checkAdPos(loadedDistance) {
    return this.refs.ad.checkPos(loadedDistance);
  }

  getLoadedDistance () {
    return document.body.scrollTop + window.innerHeight * 2;
  }

  afterAdDidLoad() {
    if (!this.hasAd()) { return; }
    const loadedDistance = this.getLoadedDistance();
    this.checkAdPos(loadedDistance);
  }

  buildAd() {
    const {
      app,
      config,
      apiOptions,
      ctx,
      loid,
      subredditTitle,
      winWidth,
    } = this.props;

    const { compact } = this.state;

    return (
      <Ad
        key='ad'
        ref='ad'
        app={ app }
        config={ config }
        apiOptions={ apiOptions }
        ctx={ ctx }
        loid={ loid }
        compact={ compact }
        site={ this.getSite() }
        subredditTitle={ subredditTitle }
        afterLoad={ this.afterAdDidLoad }
        winWidth={ winWidth }
        things={ this.props.postsAndComments }
      />
    );
  }

  lazyLoad() {
    const { postsAndComments } = this.props;
    const loadedDistance = this.getLoadedDistance();

    // We load one item at a time during scrolling to not be
    // super load heavy. If we hit the bottom of the function
    // everything is loaded and we can remove the loader listneners

    const postsStillNeedToLoad = postsAndComments.some((postOrComment, i) => {
      const postRef = this.refs[`post-${i}`];

      if (!postRef) { return; } // CommentPreviews don't need lazy loading;

      if (this.hasAd() && this.isIndexOfAd(i) && !this.checkAdPos(loadedDistance)) {
        return true;
      }

      if (postRef.loadContentIfNeeded && !postRef.loadContentIfNeeded(loadedDistance)) {
        return true;
      }
    });

    if (!postsStillNeedToLoad) {
      this.removeListeners();
    }
  }

  render() {
    const props = this.props;
    const { postsAndComments } = props;

    const renderedList = this.renderPostsAndComments(postsAndComments);

    if (props.showAds && postsAndComments.length) {
      renderedList.splice(this.state.adLocation, 0, this.buildAd());
    }

    return (
      <div className={ `PostAndCommentList ${this.props.className}` }>
        { renderedList }
      </div>
    );
  }

  renderPostsAndComments(postsAndComments) {
    const length = postsAndComments.length;
    const page = this.props.firstPage;
    const compact = this.state.compact;

    return postsAndComments.map((postOrComment, i) => {
      return this.renderPostOrComment(postOrComment, i, page, length, compact);
    });
  }

  renderPostOrComment(postOrComment, i, page, numListings, compact) {
    const index = (page * _DEFAULT_PAGE_SIZE) + i;

    if (postOrComment._type === 'Comment') {
      return this.renderCommentPreview(postOrComment, index, page);
    }

    const zIndex = numListings - i;
    return this.renderPost(postOrComment, index, zIndex, page, compact);
  }

  renderCommentPreview(comment, index, page) {
    return (
      <CommentPreview
        comment={ comment }
        key={ `page-comment-${index}` }
        page={ page }
      />
    );
  }

  renderPost(post, index, zIndex, page, compact) {
    const {
      app,
      ctx,
      apiOptions,
      winWidth,
      hideSubredditLabel,
      subredditIsNSFW,
      showOver18Interstitial,
      user,
    } = this.props;

    return (
      <Post
        post={ post }
        ref={ `post-${index}` }
        key={ `page-post-${index }` }
        z={ zIndex }
        compact={ compact }
        app={ app }
        ctx={ ctx }
        user={ user }
        apiOptions={ apiOptions }
        winWidth={ winWidth }
        hideSubredditLabel={ hideSubredditLabel }
        subredditIsNSFW={ subredditIsNSFW }
        showOver18Interstitial={ showOver18Interstitial }
      />
    );
  }
}
