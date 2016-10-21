import merge from '@r/platform/merge';
import { models } from '@r/api-client';
const { COMMENT } = models.ModelTypes;

import mergeAPIModels from './helpers/mergeAPIModels';
import mergeUpdatedModel from './helpers/mergeUpdatedModel';
import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as replyActions from 'app/actions/reply';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';
import * as commentActions from 'app/actions/comment';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case activitiesActions.RECEIVED_ACTIVITIES:
    case commentsPageActions.RECEIVED_COMMENTS_PAGE:
    case postsListActions.RECEIVED_POSTS_LIST:
    case hiddenActions.RECEIVED_HIDDEN:
    case savedActions.RECEIVED_SAVED:
    case searchActions.RECEIVED_SEARCH_REQUEST:
    case mailActions.RECEIVED: {
      const { comments } = action.apiResponse;
      return mergeAPIModels(state, comments);
    }

    case commentActions.MORE_COMMENTS_RECEIVED: {
      return mergeAPIModels(state, action.comments);
    }

    case commentActions.SAVED:
    case commentActions.DELETED: {
      const { comment } = action;
      return mergeAPIModels(state, { [comment.uuid]: comment });
    }

    case replyActions.SUCCESS: {
      const { model } = action;
      const parentComment = state[model.parentId];
      if (!parentComment) {
        // If the comment doesn't have a parent, it's in reply to a post.
        // Just merge it into state
        return mergeUpdatedModel(state, action);
      }

      // If the comment is in reply to another comment, we need to update
      // that comment to include the reply

      const updatedParent = parentComment.set({
        replies: [ model.toRecord(), ...parentComment.replies],
      });

      return merge(state, {
        [model.uuid]: model,
        [updatedParent.uuid]: updatedParent,
      });
    }

    case voteActions.VOTED: {
      return mergeUpdatedModel(state, action, { restrictType: COMMENT });
    }

    case commentActions.UPDATED_BODY: {
      let { model } = action;
      const currentComment = state[model.uuid];

      // When we update the body text of a comment, we don't get the replies
      // back. This means we have to manually copy our current copy's replies
      // field, otherwise the comment tree below the updated comment will vanish.
      if (currentComment && currentComment.replies.length && !model.replies.length) {
        model = model.set({
          replies: currentComment.replies,
          loadMoreIds: currentComment.loadMoreIds,
          loadMore: currentComment.loadMore,
        });
      }

      return merge(state, {
        [model.uuid]: model,
      });
    }

    default: return state;
  }
}
