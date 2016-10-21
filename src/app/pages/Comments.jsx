import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { some } from 'lodash/collection';
import { has } from 'lodash/object';
import * as navigationActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import * as replyActions from 'app/actions/reply';
import { flags } from 'app/constants';
import { featuresSelector } from 'app/selectors/features';
import crawlerRequestSelector from 'app/selectors/crawlerRequestSelector';

import CommentsList from 'app/components/CommentsList';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import GoogleCarouselMetadata from 'app/components/GoogleCarouselMetadata';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import SubNav from 'app/components/SubNav';
import RelevantContent from 'app/components/RelevantContent';
import { RecommendedSubreddits } from 'app/components/RecommendedSubreddits';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';

const T = React.PropTypes;

const {
  VARIANT_NEXTCONTENT_BOTTOM,
  VARIANT_RECOMMENDED_BOTTOM,
  VARIANT_RECOMMENDED_TOP,
  VARIANT_RECOMMENDED_TOP_PLAIN,
  VARIANT_SUBREDDIT_HEADER,
} = flags;

const stateProps = createSelector(
  (state, props) => props,
  state => state.commentsPages,
  state => state.posts,
  state => state.platform.currentPage,
  state => state.preferences,
  state => state.recommendedSubreddits,
  state => state.subreddits,
  state => state.comments,
  state => state.replying,
  featuresSelector,
  crawlerRequestSelector,
  (
    pageProps,
    commentsPages,
    posts,
    currentPage,
    preferences,
    recommendedSrs,
    subreddits,
    comments,
    replying,
    feature,
    isCrawlerRequest
  ) => {
    const commentsPageParams = CommentsPageHandler.pageParamsToCommentsPageParams(pageProps);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const commentsPage = commentsPages[commentsPageId];
    const topLevelComments = (!commentsPage || commentsPage.loading)
      ? []
      : commentsPage.results;
    const post = posts[commentsPageParams.id];
    const postLoaded = !!post;
    const isReplying = !!replying[commentsPageParams.id];

    let recommendedSubredditNames = [];
    if (post && post.subreddit in recommendedSrs) {
      recommendedSubredditNames = recommendedSrs[post.subreddit];
    }

    const recommendedSubreddits = recommendedSubredditNames.map(name => subreddits[name]);
    // since we return early in the render function if !postLoaded, it's OK
    // for currentSubreddit to be null here
    const currentSubreddit = post ? post.subredditDetail : null;

    return {
      op: postLoaded ? post.author : '',
      postLoaded,
      commentsPageParams,
      commentsPage,
      commentsPageId,
      topLevelComments,
      currentPage,
      preferences,
      isReplying,
      feature,
      isCrawlerRequest,
      post,
      recommendedSubreddits,
      currentSubreddit,
      comments,
    };
  },
);

const dispatchProps = dispatch => ({
  navigateToUrl: (url, query) => dispatch(
    navigationActions.navigateToUrl(METHODS.GET, url, query)
  ),
  onToggleReply: id => dispatch(replyActions.toggle(id)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { currentPage, currentPage: { queryParams } } = stateProps;
  const { navigateToUrl, onToggleReply } = dispatchProps;

  const onSortChange = sort => {
    navigateToUrl(currentPage.url, {
      queryParams: {
        ...queryParams,
        sort,
      },
    });
  };

  return {
    ...stateProps,
    ...ownProps,
    onSortChange,
    onToggleReply: () => onToggleReply(stateProps.post.name),
  };
};

class _CommentsPage extends React.Component {
  static propTypes = {
    op: T.string,
    postLoaded: T.bool,
    commentsPageParams: T.object,
    commentsPage: T.object,
    commentsPageId: T.string,
    topLevelComments: T.arrayOf(T.object),
    currentPage: T.object,
    isReplying: T.bool,
    feature: T.object,
    isCrawlerRequest: T.bool,
    post: T.object,
    recommendedSubreddits: T.arrayOf(T.object),
    currentSubreddit: T.object,
    comments: T.object,
  };

  constructor (props) {
    super(props);

    this.state = {
      expandComments: false,
    };

    this.expandComments = this.expandComments.bind(this);
  }

  expandComments() {
    this.setState({ expandComments: true });
  }

  // Takes a map from node ID to node, a maximum count, and an array of trees.
  // Returns a count of items in the resulting trees and an array of truncated trees.
  //
  // This truncates the set of comment trees to a maximum count (the array of
  // top-level comments is implicitly an array of trees). Walks the comments
  // depth-first until we have the max number of items (or else returns all the
  // items).
  //
  // Comments reference their children by ID rather than by directly listing
  // the child objects in the replies array. So we need to use the nodeMap to
  // follow the parent->child pointers. The resulting tree uses direct
  // references to children rather than indirection through the nodeMap, so
  // that we don't have to mutate the original data.
  limitTrees(nodeMap, limit, trees) {
    // If we want 0 items or don't have any comment trees, then we're done.
    if (limit === 0 || !trees || trees.length === 0) {
      return [0, []];
    }
    const first = trees[0];
    const rest = trees.slice(1);
    // Walk the first tree, pruning it to have at most limit items. We receive
    // a count because the tree may have had fewer than limit items to begin
    // with.
    const [count, pruned] = this.limitTree(nodeMap, limit, first);
    // If we haven't hit our limit, then walk the other trees and keep just
    // enough items to get us to the limit.
    if (limit > count) {
      const [restCount, restPruned] = this.limitTrees(nodeMap, limit - count, rest);
      return [count + restCount, [pruned].concat(restPruned)];
    }
    return [count, [pruned]];
  }

  // Takes a map from node ID to node, a maximum count, and a single comment
  // tree. Prunes the tree to have at most limit items.
  // Returns the actual number of items in the pruned tree as well as the
  // pruned comment tree.
  limitTree(nodeMap, limit, node) {
    const tree = nodeMap[node.uuid];
    if (limit === 0) {
      return [0, null];
    } else if (limit === 1) {
      // If we only want one item, then we can just keep the root node and
      // throw away the replies.
      return [1, { ...tree, replies: [] }];
    }
    // tree.replies is an array of comment IDs. We continue by looking up those
    // IDs to get the full comment objects for each reply, and then we prune
    // that set and use it to replace the original replies.
    const replies = tree.replies.map(({ uuid }) => nodeMap[uuid]);
    const [count, children] = this.limitTrees(nodeMap, limit - 1, replies);
    return [count + 1, { ...tree, replies: children }];
  }

  render () {
    const {
      op,
      commentsPage,
      commentsPageParams,
      topLevelComments,
      postLoaded,
      currentPage,
      preferences,
      isReplying,
      feature,
      onSortChange,
      isCrawlerRequest,
      post,
      recommendedSubreddits,
      currentSubreddit,
      comments,
      onToggleReply,
    } = this.props;

    if (!postLoaded) {
      return (
        <div className='CommentsPage'>
          <Loading />
        </div>
      );
    }

    const shouldAbbreviateComments = (
      !this.state.expandComments &&
      feature.enabled(VARIANT_RECOMMENDED_BOTTOM)
    );
    const hasRecommendations = recommendedSubreddits.length > 0 ? true : false;
    let abbreviatedComments;

    if (shouldAbbreviateComments) {
      abbreviatedComments = this.limitTrees(comments, 3, topLevelComments)[1];
    }

    return (

      <div className='CommentsPage'>
        <SubNav />
        {
          feature.enabled(VARIANT_SUBREDDIT_HEADER) &&
          (<div>
            <RecommendedSubreddits
              cssClass='RecommendedSubreddits__header'
              recommendedSubreddits={ recommendedSubreddits }
              variant='subredditHeader'
              currentSubreddit={ currentSubreddit }
            />
          </div>)
        }
        <Post postId={ commentsPageParams.id } single={ true } key='post' />
        <CommentsPageTools
          key='tools'
          isReplying={ isReplying }
          post={ post }
          hasSingleComment={ has(commentsPageParams, 'query.comment') }
          currentPage={ currentPage }
          preferences={ preferences }
          id={ commentsPageParams.id }
          onSortChange={ onSortChange }
          onToggleReply={ onToggleReply }
        />
        {
          feature.enabled(VARIANT_RECOMMENDED_TOP) && hasRecommendations &&
          (<div>
            <RecommendedSubreddits
              cssClass='RecommendedSubreddits__top'
              recommendedSubreddits={ recommendedSubreddits }
              variant='top'
            />
          </div>)
        }
        {
          feature.enabled(VARIANT_RECOMMENDED_TOP_PLAIN) &&
          hasRecommendations &&
          (<div>
            <RecommendedSubreddits
              cssClass='RecommendedSubreddits__top-plain'
              recommendedSubreddits={ recommendedSubreddits }
              variant='topPlain'
            />
          </div>)
        }

        { !commentsPage || commentsPage.loading
          ? <Loading />
          : <CommentsList
              commentRecords={ abbreviatedComments
                               ? abbreviatedComments
                               : topLevelComments }
              className='CommentsList__topLevel'
              op={ op }
              nestingLevel={ 0 }
              votingDisabled={ post.archived }
            />
        }

        { isCrawlerRequest && commentsPage && topLevelComments.length ?
          <GoogleCarouselMetadata
            postId={ commentsPageParams.id }
            commentRecords={ topLevelComments }
            pageUrl={ currentPage.url }
          />
          : null
        }

        { some([
          VARIANT_NEXTCONTENT_BOTTOM,
        ], x => feature.enabled(x)) &&
          <RelevantContent
            postId={ commentsPageParams.id }
          />
        }
        {
          shouldAbbreviateComments && hasRecommendations &&
          (<div className='RecommendedSubredditsBottom__wrapper'>
            <div className='RecommendedSubreddits__button_wrapper'>
              <button
                className='listing-comment-collapsed-more'
                onClick={ this.expandComments }
                key='comment-collapsed-more'
              >
                View More Comments
              </button>
            </div>
            <RecommendedSubreddits
              cssClass='RecommendedSubreddits__bottom'
              recommendedSubreddits={ recommendedSubreddits }
              variant='bottom'
            />
          </div>)
        }
      </div>
    );
  }
}

export const CommentsPage = connect(stateProps, dispatchProps, mergeProps)(_CommentsPage);
