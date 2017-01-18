import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';

const DEFAULT = {};

/**
 * Reducer for storing any 'continue this thread' objects. Essentially, this
 * stores the nodes in a comment tree that are placeholders for deeply nested
 * threads.
 * @name continueThread
 * @memberof module:reducers/comments
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentsPageActions.RECEIVED_COMMENTS_PAGE:
    case commentActions.MORE_COMMENTS_SUCCESS: {
      const { continueThreadObjects } = action.payload;
      return { ...state, ...continueThreadObjects };
    }
    default: return state;
  }
};
