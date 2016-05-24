import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';

const { PostModel } = models;

import {
  isPostDomainExternal,
  postShouldRenderMediaFullbleed,
} from './postUtils';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';

const T = React.PropTypes;

function _isCompact(props) {
  return props.compact && !props.single;
}

const shouldForceHTTPS = (config) => {
  return config.https || config.httpsProxy;
};

Post.propTypes = {
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
};

Post.defaultProps = {
  z: 1,
  hideWhen: false,
  hideSubredditLabel: false,
  single: false,
  subredditIsNSFW: false,
  showOver18Interstitial: false,
  winWidth: 360,
};

export function Post(props) {
  const userAgent = global.navigator && global.navigator.userAgent
    ? global.navigator.userAgent
    : '';

  const compact = _isCompact(props);
  const externalDomain = isPostDomainExternal(props.post);
  const renderMediaFullbleed = postShouldRenderMediaFullbleed(props.post);
  const forceHTTPS = shouldForceHTTPS({ https: true });
  const isAndroid = userAgent && /android/i.test(userAgent);
  const showLinksInNewTab = externalDomain && isAndroid;
  const showNSFW = !props.showOver18Interstitial && props.subredditIsNSFW;
  const { expanded, editing, winWidth, z } = props;

  const toggleExpanded = () => {};
  const toggleShowNSFW = () => {};

  const {
    post,
    user,
    single,
    hideSubredditLabel,
    hideWhen,
  } = props;

  let thumbnailOrNil;
  if (compact) {
    thumbnailOrNil = (
      <PostContent
        post={ post }
        single={ single }
        compact={ true }
        expandedCompact={ false }
        onTapExpand={ toggleExpanded }
        width={ winWidth }
        toggleShowNSFW={ toggleShowNSFW }
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
        onTapExpand={ toggleExpanded }
        width={ winWidth }
        showNSFW={ showNSFW }
        toggleShowNSFW={ toggleShowNSFW }
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
    <article className={ postCssClass } style={ { zIndex: z} }>
      <div className='Post__header-wrapper'>
        { thumbnailOrNil }
        <PostHeader
          post={ post }
          single={ single }
          compact={ compact }
          hideSubredditLabel={ hideSubredditLabel }
          hideWhen={ hideWhen }
          nextToThumbnail={ !!thumbnailOrNil }
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

const postIdSelector = (_, props) => props.postId;

const compactSeletor = (state, props) => props.forceCompact || state.compact;

const singleSelector = (_, props) => props.single;

const postModelSelector = (state, props) => state.posts[props.postId];

const combineSelectors = (postId, compact, single, post) => ({
  postId, compact, single, post,
});

const makeConnectedPostSelector = () => {
  return createSelector(
    [
      postIdSelector,
      compactSeletor,
      singleSelector,
      postModelSelector,
    ],
    combineSelectors);
};

export default connect(makeConnectedPostSelector)(Post);
