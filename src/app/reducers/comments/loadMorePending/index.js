import * as commentActions from 'app/actions/comment';

const DEFAULT = {};

/**
 * Reducer for storing whether we're pending api data for a "load more comments"
 * object.
 * @name loadMorePending
 * @memberof module:reducers/comments
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentActions.MORE_COMMENTS_PENDING: {
      const { loadMoreId } = action.payload;
      return { ...state, [loadMoreId]: true };
    }
    case commentActions.MORE_COMMENTS_SUCCESS:
    case commentActions.MORE_COMMENTS_FAILURE: {
      const { loadMoreId } = action.payload;
      return { ...state, [loadMoreId]: false };
    }
    default: return state;
  }
};
