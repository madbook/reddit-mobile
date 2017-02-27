import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { toggleModal } from '@r/widgets/modal';
import includes from 'lodash/includes';

import PostModel from 'apiClient/models/PostModel';
import * as postActions from 'app/actions/posts';
import * as reportingActions from 'app/actions/reporting';
import { performListingClick } from 'app/actions/xpromo';

import imageDomains from 'lib/imageDomains';

import {
  isPostDomainExternal,
  postShouldRenderMediaFullbleed,
} from './postUtils';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';

import features from 'app/featureFlags';
import { flags, LISTING_CLICK_TYPES } from 'app/constants';
import { removePrefix } from 'lib/eventUtils';

import {
  listingClickEnabled,
} from 'app/selectors/xpromo';

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
  subredditShowSpoilers: T.bool,
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
  subredditShowSpoilers: false,
  showOver18Interstitial: false,
  winWidth: 360,
  onToggleSavePost: () => {},
  onToggleHidePost: () => {},
  onToggleModal: () => {},
  onPostClick: () => {},
};

Post.contextTypes = {
  store: T.object,
};

export function Post(props, context) {
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

  // Spoilers differ from NSFW in that if a subreddit disables spoilers
  // we should not render the spoiler treatment. If the preference is
  // enabled we should show the spoiler treatment. We will also only show
  // the unobfuscated image if the post has been unblurred.
  const showSpoilers = props.subredditShowSpoilers && !props.unblurred;

  const {
    post,
    editing,
    editPending,
    expanded,
    user,
    single,
    hideSubredditLabel,
    hideWhen,
    interceptListingClick: unboundInterceptListingClick,
    inTitleExpandoExp,
    inMixedViewExp,
    isPlaying,
    userActivityPage,
    onPostClick,
    onToggleEdit,
    onToggleSavePost,
    onToggleHidePost,
    onStartPlaying,
    onStopPlaying,
    onReportPost,
    onUpdateSelftext,
    toggleExpanded,
    toggleShowNSFW,
    winWidth,
    z,
    onToggleModal,
    moderatingSubreddits,
    reports,
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

  const hasExpandedCompact = compact && expanded;
  const shouldPlay = !isPlaying && ((compact && !hasExpandedCompact) || !compact);
  const onTogglePlaying = shouldPlay ? onStartPlaying : onStopPlaying;
  const isSubredditModerator = includes(moderatingSubreddits.names, post.subreddit.toLowerCase());

  // Bind a new copy of interceptListingClick that uses `redux.getState` to check eligilibility
  const interceptListingClick = (e, listingClickType) => {
    const checkEligibility = postId => {
      if (single) {
        return false; // don't listing click on comments pages
      }

      const { store } = context;
      if (!store) {
        return false; // this should never happen :tm:
      }

      return listingClickEnabled(store.getState(), postId);
    };

    return unboundInterceptListingClick(checkEligibility, e, listingClickType);
  };

  let thumbnailOrNil;
  if (displayCompact) {
    thumbnailOrNil = (
      <PostContent
        post={ post }
        single={ single }
        compact={ true }
        isThumbnail={ true }
        expandedCompact={ false }
        onTapExpand={ toggleExpanded }
        togglePlaying={ onTogglePlaying }
        width={ winWidth }
        toggleShowNSFW={ toggleShowNSFW }
        showNSFW={ showNSFW }
        showSpoilers={ showSpoilers }
        editing={ false }
        forceHTTPS={ forceHTTPS }
        isDomainExternal={ externalDomain }
        renderMediaFullbleed={ renderMediaFullbleed }
        showLinksInNewTab={ showLinksInNewTab }
        interceptListingClick={ interceptListingClick }
      />
    );
  }

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
        isPlaying={ isPlaying }
        isThumbnail={ false }
        expandedCompact={ hasExpandedCompact }
        onTapExpand={ toggleExpanded }
        onToggleEdit={ onToggleEdit }
        onUpdateSelftext={ onUpdateSelftext }
        togglePlaying={ onTogglePlaying }
        width={ winWidth }
        showNSFW={ showNSFW }
        showSpoilers={ showSpoilers }
        toggleShowNSFW={ toggleShowNSFW }
        forceHTTPS={ forceHTTPS }
        isDomainExternal={ externalDomain }
        renderMediaFullbleed={ renderMediaFullbleed }
        showLinksInNewTab={ showLinksInNewTab }
        interceptListingClick={ interceptListingClick }
      />
    );
  }

  const postCssClass = `Post ${displayCompact ? 'size-compact' : 'size-default'}`;

  return (
    <article
      className={ postCssClass }
      style={ { zIndex: z} }
      onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.OTHER) }
    >
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
          onElementClick={ () => { onPostClick(post); } }
          titleOpensExpando={ inTitleExpandoExp && canExpand }
          onTapExpand={ toggleExpanded }
          isSubredditModerator={ isSubredditModerator }
          reports={ reports }
          interceptListingClick={ interceptListingClick }
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
        onElementClick={ () => { onPostClick(post); } }
        onToggleModal={ onToggleModal }
        isSubredditModerator={ isSubredditModerator }
        reports={ reports }
        interceptListingClick={ interceptListingClick }
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
  (state, props) => state.playingPosts[removePrefix(props.postId)],
  state => state.moderatingSubreddits,
  (state, props) => state.reports[props.postId],
  (
    user,
    postId,
    single,
    compact,
    post,
    expanded,
    unblurred,
    editingState,
    inTitleExpandoExp,
    inMixedViewExp,
    isPlaying,
    moderatingSubreddits,
    reports,
  ) => {
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
      isPlaying,
      moderatingSubreddits,
      reports,
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
  onStopPlaying: () => dispatch(postActions.stopPlaying(postId)),
  onStartPlaying: () => dispatch(postActions.startPlaying(postId)),
  onReportPost: () => dispatch(reportingActions.report(postId)),
  onToggleModal: () => dispatch(toggleModal(null)),
  interceptListingClick: (checkEligibility, e, listingClickType) => {
    // on any click inside a post, we might need to intercept that click
    // and turn it into an xpromo Listing Click.
    // Therefore all click event handlers should be calling this function
    // to decide if we can continue handling the click

    // To determine if we're eligible for a listing click, we need to access state.
    // If we were to check this eligiblity in the selector, we could fire bucketing
    // events before a click. If were to continually pass `state` from selectors,
    // we would re-render the Post component on every re-render.
    // As a hacky workaround, this function expects to be passed a `checkEligibility`
    // function. `Post` can use context props to access `getState` from redux,
    // and pass in the `checkEnabled` function.

    if (!checkEligibility(postId)) {
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    dispatch(performListingClick(postId, listingClickType));

    return true;
  },
});

export default connect(selector, mapDispatchToProps)(Post);
