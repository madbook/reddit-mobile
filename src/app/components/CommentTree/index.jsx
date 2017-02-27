/**
 * @module components/CommentTree
 */
import './index.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor } from 'platform/components';

import includes from 'lodash/includes';

import Comment from 'app/components/Comment';
import GoogleCarouselMetadata from 'app/components/GoogleCarouselMetadata';
import cx from 'lib/classNames';
import createCommentList from 'lib/createCommentList';
import * as commentActions from 'app/actions/comment';

import commentDispatchers, { returnDispatchers } from 'app/components/Comment/dispatchers';

import Loading from 'app/components/Loading';

import { COMMENT_LOAD_MORE } from 'apiClient/models/thingTypes';

import PostModel from 'apiClient/models/PostModel';

const T = React.PropTypes;

const NESTING_STOP_LEVEL = 6;
const PADDING = 16;

/**
 * Component for an entire comment tree. The "tree" is actually drawn entirely
 * flat, with padding being used to simulate the threading. The tree is drawn
 * flat largely for performance reasons. Requires a connection to a redux store.
 * @function
 * @param   {object} props
 * @param   {boolean} [props.post] - The post model that the tree is associated
 *                    with. Passed to the google carousel.
 * @param   {function} [props.isCrawlerRequest=false] - If the request was made
 *                    by a crawler.
 * @param   {function} [props.pageUrl] - The url of the current page.
 * @param   {function} [props.pageId] - The id of the current page (derived from url params).
 * @returns {React.Element}
 */
export function CommentTree(props) {
  const {
    comments,
    post,
    pageUrl,
    isCrawlerRequest,
    commentsPending,
  } = props;

  if (commentsPending) {
    return <Loading />;
  }

  return (
    <div className='CommentTree'>
    { isCrawlerRequest && comments.length ?
     <GoogleCarouselMetadata
       post={ post }
       comments={ comments.filter(c => c.depth === 0).map(c => c.data) }
       pageUrl={ pageUrl }
     />
     : null
    }
      <div className='CommentTree__tree'>
        { comments.map(({ depth, data, isHidden }) => {
          return renderNode(
            props,
            depth,
            data,
            isHidden,
          );
        }) }
      </div>
    </div>
  );
}

CommentTree.propTypes = {
  post: T.instanceOf(PostModel).isRequired,
  isCrawlerRequest: T.bool,
  pageUrl: T.string,
  pageId: T.string,
};

CommentTree.defaultProps = {
  isCrawlerRequest: false,
};

const renderNode = (props, depth, data, isHidden) => {
  const {
    onLoadMore,
    replyingList,
    thingsBeingEdited,
    user,
    post,
    isSubredditModerator,
    commentDispatchers,
    reports,
    postPermalink,
  } = props;
  const uuid = data.name;
  const authorType = determineAuthorType(data, user, post.author || '');
  const editObject = thingsBeingEdited[uuid];
  const isReplying = !!replyingList[uuid];

  const maxedNestingLevel = Math.min(depth, NESTING_STOP_LEVEL);
  const depthOverMax = depth - NESTING_STOP_LEVEL;
  const dotsNum = depthOverMax > 0 ? depthOverMax : 0;

  return (
    <div
      className={ cx('CommentTree__comment', {
        'm-toplevel': depth === 0,
        'm-hidden': isHidden,
      }) }
      style={ { paddingLeft: maxedNestingLevel * PADDING } }
    >
      { renderLines(maxedNestingLevel) /* render out the depth lines on the left of the comment */ }
      { data.type === 'comment'
        ?
          <Comment
            isSubredditModerator={ isSubredditModerator }
            commentReplying={ isReplying }
            authorType={ authorType }
            comment={ data }
            commentCollapsed={ data.isCollapsed }
            editing={ !!editObject }
            editPending={ !!(editObject && editObject.pending) }
            isTopLevel={ depth === 0 }
            user={ user }
            votingDisabled={ post.archived }
            dotsNum={ dotsNum }
            reports={ reports }

            { ...returnDispatchers(commentDispatchers, uuid) }
          />
        : renderContinueThread(
            e => onLoadMore(data, e),
            data,
            depth === 0,
            dotsNum,
            postPermalink,
          )
      }
    </div>
  );
};

const renderLines = depth => {
  const lines = [];
  for (let i = 0; i < depth; i++) {
    lines.push(
      <div
        className={ cx('CommentTree__commentDepthLine', { 'm-thick': i === 0 }) }
        style={ { left: PADDING * (i + 1) - 1 } }
      />
    );
  }
  return lines;
};

import fill from 'lodash/fill';
function renderDots(count) {
  const content = fill(Array(count), '•').join(' ');

  return <div className='CommentHeader__dots'>{ content }</div>;
}

const renderContinueThread = (onContinueThread, data, isTopLevel, dotsNum, postPermalink) => {
  const isPending = data.isPending;
  const isLoadMore = data.type === COMMENT_LOAD_MORE;
  const label = isLoadMore ?
    'More Comments' : 'Continue Thread';

  const id = stripTypePrefix(data.parentId);
  const url = `${postPermalink}${id}`;

  return (
    <Anchor
      className='CommentTree__continueThread'
      onClick={ onContinueThread }
      href={ url }
    >
      { renderDots(dotsNum) }
      <span className={ `icon icon-caron-circled ${isTopLevel ? 'mint': ''}` } />
      { isPending ? 'LOADING...' : label }
      { isLoadMore ? ` (${data.children.length})`: '' }
      { !isPending
        ? <div className='CommentTree__continueThreadIcon icon icon-arrowforward'/>
        : null }
    </Anchor>
  );
};

function determineAuthorType(comment, user, op) {
  if (comment.distinguished) {
    return comment.distinguished;
  } else if (user && user.name === comment.author) {
    return 'self';
  } else if (comment.author === op) {
    return 'op';
  }

  return '';
}

const selector = createSelector(
  (_, props) => props.post.subreddit,
  state => state.user,
  (state, { pageId }) => state.commentsPages.data[pageId] || [],
  (state, { pageId }) => {
    const apiData = state.commentsPages.api[pageId];
    return apiData ? apiData.pending : true;
  },
  state => state.platform.currentPage.url,
  state => state.comments.data,
  state => state.comments.loadMore,
  state => state.comments.continueThread,
  state => state.comments.collapsed,
  state => state.comments.loadMorePending,
  state => state.editingText,
  state => state.replying,
  state => state.moderatingSubreddits.names,
  state => state.reports,
  (
    subreddit,
    user,
    commentsList,
    commentsPending,
    currentUrl,
    allComments,
    allLoadMoreComments,
    allContinueThreads,
    collapsedComments,
    pendingLoadMore,
    thingsBeingEdited,
    replyingList,
    moderatingSubreddits,
    reports,
  ) => ({
    user,
    thingsBeingEdited,
    currentUrl,
    replyingList,
    isSubredditModerator: includes(moderatingSubreddits, subreddit.toLowerCase()),
    comments: commentsList.length > 0 ? createCommentList({
      commentsList,
      allComments,
      allLoadMoreComments,
      allContinueThreads,
      collapsedComments,
      pendingLoadMore,
    }) : [],
    reports,
    commentsPending,
  })
);

function stripTypePrefix(id) {
  return id.split('_')[1];
}

const dispatcher = (dispatch, { pageId, post }) => ({
  // Dispatchers for the commentTree component
  onLoadMore: (data, e) => {
    e.preventDefault();
    dispatch(commentActions.loadMore(data.uuid, pageId, post.uuid));
  },
  // Dispatchers passed to the comment.
  commentDispatchers: commentDispatchers(dispatch),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(selector, dispatcher, mergeProps)(CommentTree);
