import * as commentsPageActions from 'app/actions/commentsPage';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

/**
 * Reducer for storing the state of an api request to fetch comments data for a
 * given post
 * Structure in state: STATE.postCommentsLists.api
 * @name api
 * @memberof module:reducers/postCommentsLists
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
    case commentsPageActions.RECEIVED_COMMENTS_PAGE: {
      const { pageId, response } = action.payload;
      return {
        ...state,
        [pageId]: {
          responseCode: response.status,
          pending: false,
          errors: {},
        },
      };
    }

    case commentsPageActions.FAILED: {
      const { commentsPageId, error } = action.payload;
      const responseCode = error && error.status ? error.status : 500;

      return {
        ...state,
        [commentsPageId]: {
          responseCode,
          errors: error,
          pending: false,
        },
      };
    }

    case commentsPageActions.FETCHING_COMMENTS_PAGE: {
      const { commentsPageId } = action.payload;
      return {
        ...state,
        [commentsPageId]: {
          pending: true,
          errors: {},
        },
      };
    }
    default: return state;
  }
};
