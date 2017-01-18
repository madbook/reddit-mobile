import * as activitiesActions from 'app/actions/activities';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as mailActions from 'app/actions/mail';
import * as postsListActions from 'app/actions/postsList';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as similarPostsActions from 'app/actions/similarPosts';
import * as wikiActions from 'app/actions/wiki';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case activitiesActions.RECEIVED_ACTIVITIES:
    case commentsPageActions.RECEIVED_COMMENTS_PAGE:
    case mailActions.RECEIVED:
    case postsListActions.RECEIVED_POSTS_LIST:
    case savedActions.RECEIVED_SAVED:
    case searchActions.RECEIVED_SEARCH_REQUEST:
    case similarPostsActions.RECEIVED_SIMILAR_POSTS:
    case wikiActions.RECEIVED_WIKI: {
      const response = action.payload ?
        action.payload.response : action.apiResponse.response;
      const pixel = response.headers['x-reddit-tracking'] || state.pixel;
      return {
        ...state,
        pixel,
      };
    }

    default: return state;
  }
}
