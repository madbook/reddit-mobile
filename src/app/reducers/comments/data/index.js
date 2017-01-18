import { COMMENT } from 'apiClient/models/thingTypes';

import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';

import * as replyActions from 'app/actions/reply';
import * as loginActions from 'app/actions/login';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';
import * as modToolActions from 'app/actions/modTools';

import * as searchActions from 'app/actions/search';
import * as savedActions from 'app/actions/saved';
import * as hiddenActions from 'app/actions/hidden';
import * as postsListActions from 'app/actions/postsList';
import * as activitiesActions from 'app/actions/activities';

import mergeAPIModels from 'app/reducers/helpers/mergeAPIModels';
import mergeUpdatedModel from 'app/reducers/helpers/mergeUpdatedModel';
import merge from '@r/platform/merge';

const DEFAULT = {};

/**
 * Reducer for storing comments. Comments are stored flat and keyed by their id.
 * Structure in state: STATE.comments.data
 * @name data
 * @memberof module:reducers/comments
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }
    case commentsPageActions.RECEIVED_COMMENTS_PAGE:
    case commentActions.MORE_COMMENTS_SUCCESS: {
      const { comments } = action.payload;
      return { ...state, ...comments };
    }
    case replyActions.SUCCESS: {
      const { model } = action;
      return { ...state, [model.uuid]: model };
    }
    case commentActions.SAVED:
    case commentActions.DELETED: {
      const { comment } = action;
      return mergeAPIModels(state, { [comment.uuid]: comment });
    }
    case activitiesActions.RECEIVED_ACTIVITIES:
    case postsListActions.RECEIVED_POSTS_LIST:
    case hiddenActions.RECEIVED_HIDDEN:
    case savedActions.RECEIVED_SAVED:
    case searchActions.RECEIVED_SEARCH_REQUEST:
    case mailActions.RECEIVED: {
      const { comments } = action.apiResponse;
      return mergeAPIModels(state, comments);
    }
    case commentActions.UPDATED_BODY: {
      const { model } = action;

      return merge(state, {
        [model.uuid]: model,
      });
    }
    case voteActions.PENDING:
    case voteActions.SUCCESS: {
      return mergeUpdatedModel(state, action, { restrictType: COMMENT });
    }

    case modToolActions.MODTOOLS_APPROVAL_SUCCESS: {
      const { thing, username } = action;

      if (thing.type === COMMENT) {
        return mergeUpdatedModel(
          state,
          {
            model: thing.set({
              approved: true,
              removed: false,
              spam: false,
              approvedBy: username,
            }),
          },
        );
      }

      return state;
    }

    case modToolActions.MODTOOLS_REMOVAL_SUCCESS: {
      const { thing, spam, username } = action;

      if (thing.type === COMMENT) {
        return mergeUpdatedModel(
          state,
          {
            model: thing.set({
              approved: false,
              removed: !spam,
              spam: spam,
              bannedBy: username,
            }),
          },
        );
      }

      return state;
    }

    case modToolActions.MODTOOLS_DISTINGUISH_SUCCESS: {
      const { thing, distinguishType } = action;

      if (thing.type === COMMENT) {
        return mergeUpdatedModel(
          state,
          {
            model: thing.set({
              distinguished: distinguishType,
            }),
          },
        );
      }

      return state;
    }

    case modToolActions.MODTOOLS_SET_STICKY_COMMENT_SUCCESS: {
      const { thing, isStickied } = action;

      if (thing.type !== COMMENT) { return state; }

      return mergeUpdatedModel(
        state,
        {
          model: thing.set({
            stickied: isStickied,
          }),
        },
      );
    }

    default: return state;
  }
};
