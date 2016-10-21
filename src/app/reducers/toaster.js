import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as replyActions from 'app/actions/reply';
import * as commentActions from 'app/actions/comment';
import * as toasterActions from 'app/actions/toaster';
import * as postActions from 'app/actions/posts';
import * as postingActions from 'app/actions/posting';
import * as reportingActions from 'app/actions/reporting';
import * as mailActions from 'app/actions/mail';

const DEFAULT = {
  isOpen: false,
  type: null,
  message: null,
};

export const GENERIC_ERROR = 'Something went wrong.';

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case replyActions.FAILURE:
    case commentActions.FAILED_UPDATE_BODY:
    case mailActions.FAILED_MESSAGE:
    case postActions.FAILED_UPDATE_SELF_TEXT:
    case postingActions.FAILURE:
    case postingActions.VALIDATION_FAILURE:
    case reportingActions.FAILURE: {
      return merge(state, {
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: action.message || GENERIC_ERROR,
      });
    }

    case reportingActions.SUCCESS: {
      return merge(state, {
        isOpen: true,
        type: toasterActions.TYPES.REPORT_SUCCESS,
        message: action.message,
      });
    }

    case replyActions.SUCCESS: {
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
