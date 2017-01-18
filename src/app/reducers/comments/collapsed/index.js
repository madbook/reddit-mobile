import * as commentActions from 'app/actions/comment';

const DEFAULT = {};

/**
 * Reducer for storing which comments are collapsed.
 * @name collapsed
 * @memberof module:reducers/comments
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentActions.TOGGLE_COLLAPSE: {
      const { id } = action.payload;
      return { ...state, [id]: !state[id] };
    }
    default: return state;
  }
};
