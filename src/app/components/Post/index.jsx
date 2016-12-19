import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';
import { toggleModal } from '@r/widgets/modal';
const { PostModel } = models;

import * as modalActions from 'app/actions/modal';
import * as postActions from 'app/actions/posts';
import * as reportingActions from 'app/actions/reporting';

import imageDomains from 'lib/imageDomains';

import {
  isPostDomainExternal,
  postShouldRenderMediaFullbleed,
} from './postUtils';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';

import features from 'app/featureFlags';
import { flags } from 'app/constants'; 

const { 
  VARIANT_TITLE_EXPANDO,
  VARIANT_MIXED_VIEW,
} = flags;

const noExpandoPostTypes = new Set(['link', 'self', '']);

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
  userActivityPage: T.bool,
  z: T.number,
  onToggleSavePost: T.func,
  onToggleHidePost: T.func,
  onReportPost: T.func.isRequired,
  onToggleModal: T.func.isRequired,
  onPostClick: T.func,
};

Post.defaultProps = {
  z: 1,
  hideWhen: false,
  hideSubredditLabel: false,
  single: false,
  subredditIsNSFW: false,
  showOver18Interstitial: false,
  winWidth: 360,
  onToggleSavePost: () => {},
  onToggleHidePost: () => {},
  onToggleModal: () => {},
  onPostClick: () => {},
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
  const showNSFW = props.subredditIsNSFW || props.unblurred;

  const {
    post,
    editing,
    editPending,
    expanded,
    user,
    single,
    hideSubredditLabel,
    hideWhen,
    inTitleExpandoExp,
    inMixedViewExp,
    userActivityPage,
    onPostClick,
    onToggleEdit,
    onToggleSavePost,
    onToggleHidePost,
    onReportPost,
    onUpdateSelftext,
    onElementClick,
    toggleExpanded,
    toggleShowNSFW,
    winWidth,
    z,
    onToggleModal,
  } = props;

  const canExpand = post.preview && post.preview.images.length > 0 || !!post.oembed;
  const isImage = imageDomains.has(post.domain);
  const mixedExpActive = inMixedViewExp &&
    (noExpandoPostTypes.has(post.postHint) && !isImage);
  const displayCompact = compact || mixedExpActive;
  if (post.isBlankAd) {
    // Return an empty div if it's a blank ad
    return <div class='blankAd'/>;
  }

  let thumbnailOrNil;
  if (displayCompact) {
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
  const isPromotedUserPost = post.promoted && post.originalLink;
  let contentOrNil;
  if (!displayCompact || hasExpandedCompact) {
    contentOrNil = (
      <PostContent
        post={ post }
        editing={ editing }
        editPending={ editPending }
        single={ single }
        compact={ displayCompact }
        expandedCompact={ hasExpandedCompact }
        onTapExpand={ toggleExpanded }
        onToggleEdit={ onToggleEdit }
        onUpdateSelftext={ onUpdateSelftext }
        width={ winWidth }
        showNSFW={ showNSFW }
        toggleShowNSFW={ toggleShowNSFW }
        forceHTTPS={ forceHTTPS }
        isDomainExternal={ externalDomain }
        renderMediaFullbleed={ renderMediaFullbleed }
        showLinksInNewTab={ showLinksInNewTab }
      />
    );
  }

  const postCssClass = `Post ${displayCompact ? 'size-compact' : 'size-default'}`;

  return (
    <article className={ postCssClass } style={ { zIndex: z} }>
      <div className='Post__header-wrapper'>
        { thumbnailOrNil }
        <PostHeader
          post={ post }
          isPromotedUserPost={ isPromotedUserPost }
          single={ single }
          compact={ displayCompact }
          hideSubredditLabel={ hideSubredditLabel }
          hideWhen={ hideWhen }
          nextToThumbnail={ !!thumbnailOrNil }
          showingLink={ !!(displayCompact && !hasExpandedCompact && externalDomain) }
          renderMediaFullbleed={ renderMediaFullbleed }
          showLinksInNewTab={ showLinksInNewTab }
          onElementClick={ () => { onPostClick(post); onElementClick(); } }
          titleOpensExpando={ inTitleExpandoExp && canExpand }
          onTapExpand={ toggleExpanded }
        />
      </div>
      { contentOrNil }
      <PostFooter
        user={ user }
        single={ single }
        compact={ displayCompact }
        post={ post }
        viewComments={ !single }
        hideDownvote={ userActivityPage || post.archived }
        onToggleEdit={ onToggleEdit }
        onToggleSave={ onToggleSavePost }
        onToggleHide={ onToggleHidePost }
        onReportPost={ onReportPost }
        onElementClick={ () => { onPostClick(post); onElementClick(); } }
        onToggleModal={ onToggleModal }
      />
    </article>
  );
}

const selector = createSelector(
  state => state.user,
  (_, props) => props.postId,
  (_, props) => props.single,
  (state, props) => props.forceCompact || state.compact,
  (state, props) => state.posts[props.postId],
  (state, props) => !!state.expandedPosts[props.postId],
  (state, props) => !!state.unblurredPosts[props.postId],
  (state, props) => state.editingText[props.postId],
  state => features.withContext({ state }).enabled(VARIANT_TITLE_EXPANDO),
  state => features.withContext({ state }).enabled(VARIANT_MIXED_VIEW),
  (user, postId, single, compact, post, expanded, unblurred, editingState,
                                        inTitleExpandoExp, inMixedViewExp) => {
    const editing = !!editingState;
    const editPending = editing && editingState.pending;

    return {
      user,
      postId,
      single,
      compact,
      post,
      expanded,
      unblurred,
      editing,
      editPending,
      inTitleExpandoExp,
      inMixedViewExp,
    };
  }
);

const mapDispatchToProps = (dispatch, { postId }) => ({
  toggleExpanded: (clickTarget) => dispatch(postActions.toggleExpandPost(postId, clickTarget)),
  toggleShowNSFW: () => dispatch(postActions.toggleNSFWBlur(postId)),
  onToggleEdit: () => dispatch(postActions.toggleEdit(postId)),
  onUpdateSelftext: (newSelfText) => dispatch(postActions.updateSelfText(postId, newSelfText)),
  onToggleSavePost: () => dispatch(postActions.toggleSavePost(postId)),
  onToggleHidePost: () => dispatch(postActions.toggleHidePost(postId)),
  onReportPost: () => dispatch(reportingActions.report(postId)),
  onElementClick: () => dispatch(modalActions.showXpromoModal()),
  onToggleModal: () => dispatch(toggleModal(null)),
});

export default connect(selector, mapDispatchToProps)(Post);
