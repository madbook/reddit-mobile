import merge from '@r/platform/merge';
import * as apiResponseActions from '../actions/apiResponseActions'

export const apiResponseReducerMaker = (key, kind) => {
  if (!kind) {
    kind = key;
  }

  const DEFAULT = {};

  return (state=DEFAULT, action={}) => {
    switch(action.type) {
      case apiResponseActions.RECEIEVED_API_RESPONSE: {
        const { apiResponse } = action;
        const apiResponseStore = apiResponse[kind];

        if (apiResponseStore && Object.keys(apiResponseStore).length) {
          return merge(state, apiResponseStore);
        }

        return state;
      }

      default: return state;
    }
  };
};
