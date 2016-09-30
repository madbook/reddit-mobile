/*
The Overlay Reducer is responsible for tracking what overlay
menu is open and visible to the user. The actions from
`src/app/actions/overlay.js` handle opening overlays.
Anytime the user changes pages, we'll close the current overlay (if any)
*/

import * as platformActions from '@r/platform/actions';

import * as compactActions from 'app/actions/compact';
import * as overlayActions from 'app/actions/overlay';
import * as themeActions from 'app/actions/theme';

export const DEFAULT_STATE = null;

export default function(state=DEFAULT_STATE, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE:
    case compactActions.SET_COMPACT: // close after setting compact in settings menu
    case overlayActions.CLOSE_OVERLAY:
    case themeActions.SET_THEME: { // close after setting theme in settings menu
      return DEFAULT_STATE;
    }

    case overlayActions.TOGGLE_OVERLAY: {
      const { kind } = action;

      // If we don't have a kind, the action is broken.
      // Otherwise check if its the same overlay, if its the same
      // consider this an intent to toggle the overlay to closed.
      if (!kind || kind === state) { return DEFAULT_STATE; }

      return kind;
    }

    default: return state;
  }
}
