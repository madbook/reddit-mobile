import merge from '@r/platform/merge';

import * as apiResponseActions from 'app/actions/apiResponse';
import * as loginActions from 'app/actions/login';

export const apiResponseReducerMaker = (kind) => {
  const DEFAULT = {};

  return (state=DEFAULT, action={}) => {
    switch (action.type) {
      case loginActions.LOGGED_IN:
      case loginActions.LOGGED_OUT: {
        return DEFAULT;
      }

      case apiResponseActions.RECEIVED_API_RESPONSE: {
        const { apiResponse } = action;
        const apiResponseStore = apiResponse.typeToTable[kind];

        if (apiResponseStore && Object.keys(apiResponseStore).length) {
          return merge(state, apiResponseStore);
        }

        return state;
      }

      case apiResponseActions.UPDATED_MODEL:
      case apiResponseActions.NEW_MODEL:
        {
          const { model, kind: actionKind } = action;
          if (actionKind === kind && model.uuid) {
            return merge(state, { [model.uuid]: model });
          }

          return state;
        }

      default: return state;
    }
  };
};
