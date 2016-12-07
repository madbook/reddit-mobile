import * as postActions from 'app/actions/posts';
import { SET_PAGE, GOTO_PAGE_INDEX } from '@r/platform/actions';
import { removePrefix } from 'lib/eventUtils';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case GOTO_PAGE_INDEX: {
      return DEFAULT;
    }

    case SET_PAGE: {
      const postId = action.payload.urlParams.postId;
      // Adam 12/2016: only do this if not on ios since it will autoexpand.
      // We can remove this for ios10 and up when we are on react >= v15.3.2
      // the navigator check is done here to avoid changing the SET_PAGE action
      if (postId && typeof window === 'object' && window.navigator) {
        const iOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream;
        if (state[postId] && !iOS) {
          return { [postId]: true };
        }
      }
      return DEFAULT;
    }

    case postActions.START_PLAYING: {
      const postId = removePrefix(action.thingId);
      const currentlyPlaying = state[postId];

      if (currentlyPlaying) {
        return state;
      }

      return {
        ...state,
        [postId]: true,
      };
    }

    case postActions.STOP_PLAYING: {
      const postId = removePrefix(action.thingId);
      if (state[postId]) {
        const nextState = { ...state };
        delete nextState[postId];
        return nextState;
      }

      return state;
    }

    default: return state;
  }
}
