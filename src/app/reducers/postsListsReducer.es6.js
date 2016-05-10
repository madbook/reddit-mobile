import merge from '@r/platform/merge';
import * as postsListActions from '../actions/postsListActions';
import { newPostsList } from '../models/PostsListModel.es6.js';
import { each } from 'lodash/array';

const DEFAULT = {};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case postsListActions.FETCHING_POSTS_LIST: {
      const { postsListId, postsParams } = action;
      const currentPostsList = state[postsListId];
      if (currentPostsList) { return state; }

      return merge(state, {
        [postsListId]: newPostsList(postsListId, postsParams),
      });
    }

    case postsListActions.RECEIEVED_POSTS_LIST: {
      const { postsListId, postsListResults } = action;
      const currentPostsList = state[postsListId];
      if (!currentPostsList) { return state; }

      return merge(state, {
        [postsListId]: {
          loading: false,
          results: postsListResults,
        },
      });
    }

    case postsListActions.LOADING_MORE_POSTS: {
      const { postsListId } = action;
      const currentPostsList = state[postsListId];
      if (!currentPostsList) { return state; }

      return merge(state, {
        [postsListId]: {
          loadingMore: true,
        },
      });
    }

    case postsListActions.RECEIEVED_MORE_POSTS: {
      const { postsListId, postsListResults } = action;
      const currentPostsList = state[postsListId];
      if (!currentPostsList) { return state; }

      const newPostResults = currentPostsList.results.slice();
      const currentPosts = new Set(newPostResults.map(result => result.uuid));
      each(postsListResults, result => {
        if (!currentPosts.has(result.uuid)) {
          currentPosts.add(result.uuid);
          newPostResults.push(result);
        }
      });

      return merge(state, {
        [postsListId]: {
          loadingMore: false,
          results: newPostResults,
        },
      });
    }


    default: return state;
  }
};
