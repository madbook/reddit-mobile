/*
This reducer tracks what the user is editing within the app.
Specifically, it maps thingId to either:
a) nothing, `undefined`, if a thing isn't currently being edited  _or_ if
it has finished being edited, with no api failures
b) an object describing the edit status.

Here are some examples states the reducer could be in:

a post that is in the middle of editing
{
  t3_1234: {
    pending: false, // bool: is the api call pending
    error: null, // any|null: the error object we get back from node-api-client if it failed
  },
}

a post that who's editing api-call is in flight
{
  t3_1234: {
    pending: true,
    error: null
  }
}

a post who's edit failed
{
  t3_1234: {
    pending: false,
    error: (new ValidationError(...)),
  }
}

NOTE: if edit succeeds, the object will be removed from state
*/
import omit from 'lodash/omit';

import merge from 'platform/merge';
import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

export const DEFAULT_STATE = {};

export default function(state=DEFAULT_STATE, action={}) {
  switch (action.type) {
    // if you log in / out what you're allowed to edit has changed, clear it
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT_STATE;
    }

    case commentActions.TOGGLE_EDIT:
    case postActions.TOGGLE_EDIT: {
      const { thingId } = action;

      if (state[thingId]) {
        return omit(state, thingId);
      }

      return merge(state, {
        [thingId]: {
          pending: false,
          error: null,
        },
      });
    }

    case commentActions.UPDATING_BODY:
    case postActions.UPDATING_SELF_TEXT: {
      const { thingId } = action;

      return merge(state, {
        [thingId]: {
          pending: true,
          error: null, // clear old error state if it exists
        },
      });
    }

    case commentActions.UPDATED_BODY:
    case postActions.UPDATED_SELF_TEXT: {
      const { model } = action;
      return omit(state, model.uuid);
    }

    case commentActions.FAILED_UPDATE_BODY:
    case postActions.FAILED_UPDATE_SELF_TEXT: {
      const { thingId, error } = action;
      return merge(state, {
        [thingId]: {
          pending: false,
          error,
        },
      });
    }

    default: return state;
  }
}
