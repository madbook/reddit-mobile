import './Post.less';

import React from 'react';
import { Anchor } from '@r/platform/components';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';

const { PostModel } = models;

import {
  isPostDomainExternal,
  postShouldRenderMediaFullbleed,
} from './postUtils';

import PostHeader from './PostHeader/PostHeader';
import PostContent from './PostContent/PostContent';
import PostFooter from './PostFooter/PostFooter';

const T = React.PropTypes;

function _isCompact(props) {
  return props.compact && !props.single;
}

export class Post extends React.Component {
  static propTypes = {
    post: T.instanceOf(PostModel),
    postId: T.string,
    user: T.object,
    compact: T.bool,
    hideComments: T.bool,
    hideSubredditLabel: T.bool,
    hideWhen: T.bool,
    subredditIsNSFW: T.bool,
    showOver18Interstitial: T.bool,
    single: T.bool,
    z: T.number,
  }

  static defaultProps = {
    z: 1,
    hideWhen: false,
    hideSubredditLabel: false,
    single: false,
    subredditIsNSFW: false,
    showOver18Interstitial: false,
    winWidth: 360,
  };

  constructor(props) {
    super(props);


    const userAgent = global.navigator && global.navigator.userAgent ? global.navigator.userAgent : '';

    const compact = _isCompact(props);
    this.externalDomain = isPostDomainExternal(props.post);
    this.renderMediaFullbleed = postShouldRenderMediaFullbleed(props.post);
    this.forceHTTPS = this.shouldForceHTTPS({ https: true });
    const isAndroid = userAgent && /android/i.test(userAgent);
    this.showLinksInNewTab = this.externalDomain && isAndroid;

    this.state = {
      compact,
      showNSFW: !props.showOver18Interstitial && props.subredditIsNSFW,
      expanded: false,
      loaded: false,
      reported: props.post.reported,
      hidden: props.post.hidden,
      width: props.winWidth,
      editing: false,
    };

    this.onReport = this.onReport.bind(this);
    this.onHide = this.onHide.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleShowNSFW = this.toggleShowNSFW.bind(this);
    this.onResize = this.onResize.bind(this);
    this.loadContentIfNeeded = this.loadContentIfNeeded.bind(this);
  }

  componentDidMount() {
    if (this.props.single) {
      this.loadContentIfNeeded();
      this.onResize();
    }
  }

  onReport() {
    this.setState({ reported: true });
  }

  onHide() {
    this.setState({ hidden: true });
  }

  toggleExpanded(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  }

  toggleShowNSFW(e) {
    e.preventDefault();
    this.setState({ showNSFW: !this.state.showNSFW });
  }

  shouldForceHTTPS(config) {
    return config.https || config.httpsProxy;
  }

  loadContentIfNeeded(windowOffset) {
    if (this.state.loaded) {
      return true;
    }

    if (!this.refs.rootNode) {
      return false;
    }

    const top = this.refs.rootNode.getBoundingClientRect().top;
    if (top < windowOffset) {
      this.setState({ loaded: true }, this.onResize);
      return true;
    }

    return false;
  }

  onResize() {
    const node = this.refs.rootNode;
    if (!node) {
      return;
    }

    const newState = {};
    newState.width = node.offsetWidth;
    this.setState(newState);
  }

  render() {
    const {
      post,
      user,
      single,
      hideSubredditLabel,
      hideWhen,
    } = this.props;

    const {
      compact,
      showNSFW,
      expanded,
      z,
      width,
      editing,
    } = this.state;

    const { externalDomain, renderMediaFullbleed, forceHTTPS,
      showLinksInNewTab } = this;

    let thumbnailOrNil;
    if (compact) {
      thumbnailOrNil = (
        <PostContent
          post={ post }
          single={ single }
          compact={ true }
          expandedCompact={ false }
          onTapExpand={ this.toggleExpanded }
          width={ width }
          toggleShowNSFW={ this.toggleShowNSFW }
          showNSFW={ showNSFW }
          editing={ false }
          forceHTTPS={ forceHTTPS }
          isDomainExternal={ externalDomain }
          renderMediaFullbleed={ renderMediaFullbleed }
          showLinksInNewTab={ showLinksInNewTab }
        />
      );
    }

    const hasExpandedCompact = compact && expanded;
    let contentOrNil;
    if (!compact || hasExpandedCompact) {
      contentOrNil = (
        <PostContent
          post={ post }
          single={ single }
          compact={ compact }
          expandedCompact={ hasExpandedCompact }
          onTapExpand={ this.toggleExpanded }
          width={ width }
          showNSFW={ showNSFW }
          toggleShowNSFW={ this.toggleShowNSFW }
          editing={ editing }
          forceHTTPS={ forceHTTPS }
          isDomainExternal={ externalDomain }
          renderMediaFullbleed={ renderMediaFullbleed }
          showLinksInNewTab={ showLinksInNewTab }
        />
      );
    }

    const postCssClass = `Post ${compact ? 'size-compact' : 'size-default'}`;

    return (
      <article ref='rootNode' className={ postCssClass } style={ { zIndex: z} }>
        <div className='Post__header-wrapper'>
          { thumbnailOrNil }
          <PostHeader
            post={ post }
            single={ single }
            compact={ compact }
            hideSubredditLabel={ hideSubredditLabel }
            hideWhen={ hideWhen }
            nextToThumbnail={ false }
            showingLink={ !!(compact && !hasExpandedCompact && externalDomain) }
            renderMediaFullbleed={ renderMediaFullbleed }
            showLinksInNewTab={ showLinksInNewTab }
            />
        </div>
        { contentOrNil }
        <PostFooter
          user={ user }
          single={ single }
          compact={ compact }
          post={ post }
          viewComments={ !single }
        />
      </article>
    );
  }
}

const postIdSelector = (state, props) => props.postId;

const postModelSelector = (state, props) => state.posts[props.postId];

const singleSelector = (state, props) => props.singled;

const combineSelectors = (postId, post, single) => ({
  postId, post, single,
});

const makeConnectedPostSelector = () => {
  return createSelector([postIdSelector, postModelSelector, singleSelector],
    combineSelectors);
};

export default connect(makeConnectedPostSelector)(Post);
