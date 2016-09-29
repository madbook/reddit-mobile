import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as toasterActions from 'app/actions/toaster';
import * as postingActions from 'app/actions/posting';
import * as reportingActions from 'app/actions/reporting';

const DEFAULT = {
  isOpen: false,
  type: null,
  message: null,
};

export const GENERIC_ERROR = 'Something went wrong.';

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case postingActions.VALIDATION_FAILURE:
    case reportingActions.FAILURE:
    case postingActions.FAILURE: {
      return merge(state, {
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: action.message || GENERIC_ERROR,
      });
    }

    case reportingActions.SUCCESS: {
      return merge(state, {
        isOpen: true,
        type: toasterActions.TYPES.SUCCESS,
        message: action.message,
      });
    }

    case platformActions.SET_PAGE:
    case toasterActions.CLOSE: {
      return merge(state, {
        isOpen: false,
        type: null,
        message: null,
      });
    }

    default:
      return state;
  }
}
