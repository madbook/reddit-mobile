import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { navigateToUrl } from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import filter from 'lodash/fp/filter';
import first from 'lodash/fp/first';
import flow from 'lodash/fp/flow';

import getSubreddit from 'lib/getSubredditFromState';
import mobilify from 'lib/mobilify';

import { featuresSelector } from 'app/selectors/features';
import { flags } from 'app/constants';

import PostContent from 'app/components/Post/PostContent';

import { paramsToPostsListsId } from 'app/models/PostsList';
import { relevantContentPostsParams } from 'app/actions/commentsPage';

import {
  isPostDomainExternal,
  cleanPostHREF,
} from 'app/components/Post/postUtils';

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;


const T = React.PropTypes;

function NextPost(props) {
  const {
    topPosts,
    width,
    postId,
    visited,
    goToPost,
    loid: { loid, loidCreated },
    isSelf: isSelfText,
  } = props;

  const safeAndNew = (post =>
    !post.over_18 &&
    post.uuid !== postId &&
    !post.stickied &&
    (visited.indexOf(post.id) === -1));

  const post = flow(
    filter(safeAndNew),
    first
  )(topPosts);

  if (!post) {
    return null;
  }

  const linkExternally = post.disable_comments;
  const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
  const { id, title, name } = post;
  // Make sure we always have an image to show
  // Link to the comment thread instead of external content
  const postWithFallback = {
    preview: {},
    ...post,
    thumbnail: post.thumbnail || 'img/placeholder-thumbnail.svg',
    cleanUrl: '#',
  };

  const onClick = (e => {
    e.preventDefault();
    goToPost({
      url,
      id: name,
      isSelfText,
      loid,
      loidCreated,
    });
  });

  const variant = 'bottom';
  const descriptor = (
    <span className='PostHeader__post-descriptor-line'>
      { post.ups } upvotes in r/{ post.subreddit }
    </span>
  );
  const actionText = 'NEXT';

  const externalDomain = isPostDomainExternal(postWithFallback);

  return (
    <div
      className={ `NextContent container ${variant}` }
      key='nextcontent-container'
      onClick={ onClick }
    >
      <article className='Post' key={ id }>
        <div className='NextContent__post-wrapper'>
          <PostContent
            post={ postWithFallback }
            single={ false }
            compact={ true }
            expandedCompact={ false }
            onTapExpand={ function () {} }
            width={ width }
            toggleShowNSFW={ false }
            showNSFW={ false }
            editing={ false }
            toggleEditing={ false }
            saveUpdatedText={ false }
            forceHTTPS={ true }
            isDomainExternal={ externalDomain }
            renderMediaFullbleed={ true }
            showLinksInNewTab={ false }
          />
          <header className='NextContent__header'>
            <div className='NextContent__post-descriptor-line'>
              <span className='NextContent__post-title-line'>
                { title }
              </span>
            </div>
            { descriptor }
          </header>
        </div>
        <div className='NextContent__next-link'>
          { actionText }
          <span className='icon-nav-arrowforward icon' />
        </div>
      </article>
    </div>
  );
}

RelevantContent.propTypes = {
  postId: T.string.isRequired,
  post: T.object,
  topPosts: T.arrayOf(T.object).isRequired,
  feature: T.object.isRequired,
  visited: T.arrayOf(T.string).isRequired,
  loid: T.object,
};

RelevantContent.defaultProps = {
  winWidth: 360,
};

function RelevantContent(props) {
  const {
    feature,
    postId,
    winWidth,
    topPosts,
    visited,
    goToPost,
    loid,
    post,
  } = props;

  if (feature.enabled(VARIANT_NEXTCONTENT_BOTTOM)) {
    if (!post || topPosts.length === 0) {
      return null;
    }

    return (
      <NextPost
        topPosts={ topPosts }
        width={ winWidth }
        postId={ postId }
        visited={ visited }
        goToPost={ goToPost }
        loid={ loid }
        isSelf={ post.isSelf }
      />
    );
  }

  return null;
}

const makeSelector = createSelector(
  (_, props) => props.postId,
  (state, props) => state.posts[props.postId],
  state => state.posts,
  featuresSelector,
  state => state.visitedPosts,
  state => state.loid,
  getSubreddit,
  state => state.postsLists,
  (postId, post, posts, feature, visited, loid, subredditName, postsLists) => {
    const postsParams = relevantContentPostsParams({
      subredditName,
    });
    const postsListId = paramsToPostsListsId(postsParams);
    const postsList = postsLists[postsListId];

    const topPostIds = (!postsList || postsList.loading) ? [] : postsList.results;
    const topPosts = topPostIds.map(({ uuid }) => posts[uuid]);

    return {
      postId,
      post,
      topPosts,
      feature,
      visited,
      loid,
    };
  },
);

const mapDispatchToProps = (dispatch) => ({
  goToPost: ({
    url,
  }) => {
    // This will also issue the event tracking action eventually.
    dispatch(navigateToUrl(METHODS.GET, url));
  },
});

export default connect(makeSelector, mapDispatchToProps)(RelevantContent);
