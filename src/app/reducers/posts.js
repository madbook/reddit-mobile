import { models } from '@r/api-client';
const { POST } = models.ModelTypes;

import mergeAPIModels from './helpers/mergeAPIModels';
import mergeUpdatedModel from './helpers/mergeUpdatedModel';
import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as adActions from 'app/actions/ads';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postActions from 'app/actions/posts';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';

const DEFAULT = {};

// Helper function to maintain preview information, because it's inconsistent
// depending on which api the post was received from initially
const preservePostContentPreviews = (state, post) => {
  const currentPost = state[post.uuid];
  if (!currentPost) { return post; }

  return post.set({
    expandedContent: currentPost.expandedContent,
    media: currentPost.media,
    mediaOembed: currentPost.mediaOembed,
    preview: currentPost.preview,
    selfTextMD: currentPost.selfTextMD,
    selfTextHTML: currentPost.selfTextHTML,
  });
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case activitiesActions.RECEIVED_ACTIVITIES:
    case postsListActions.RECEIVED_POSTS_LIST:
    case hiddenActions.RECEIVED_HIDDEN:
    case savedActions.RECEIVED_SAVED:
    case searchActions.RECEIVED_SEARCH_REQUEST:
    case mailActions.RECEIVED: {
      const { posts } = action.apiResponse;
      return mergeAPIModels(state, posts);
    }


    case postActions.TOGGLE_SAVE_RECEIVED:
    case postActions.TOGGLE_HIDE_RECEIVED: {
      const { post } = action;
      return mergeAPIModels(state, { [post.uuid]: post });
    }

    case adActions.RECEIVED:
    case voteActions.PENDING:
    case voteActions.SUCCESS:
    case postActions.UPDATED_SELF_TEXT: {
      return mergeUpdatedModel(state, action, { restrictType: POST });
    }

    // Posts from the comments page api don't always have the same previews
    // as that same post from the listings api. Preserve the previews so things
    // don't disappear unexpectedly
    case commentsPageActions.RECEIVED_COMMENTS_PAGE: {
      const { posts } = action.apiResponse;
      const newPosts = Object.keys(posts).reduce((newPosts, uuid) => {
        return {
          ...newPosts,
          [uuid]: preservePostContentPreviews(state, posts[uuid]),
        };
      }, {});

      return mergeAPIModels(state, newPosts);
    }

    default: return state;
  }
}
