import merge from '@r/platform/merge';

import * as loginActions from 'app/actions/login';
import * as adActions from 'app/actions/ads';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case adActions.FETCHING: {
      const { adId } = action;
      return merge(state, {
        [adId]: {
          adId,
          pending: true,
          ad: undefined,
          impressionTracked: false,
          failed: false,
        },
      });
    }

    case adActions.RECEIVED: {
      const { adId, model } = action;
      return merge(state, {
        [adId]: {
          pending: false,
          ad: model.toRecord(),
        },
      });
    }

    case adActions.NO_AD: {
      const { adId } = action;
      return merge(state, {
        [adId]: {
          pending: false,
        },
      });
    }

    case adActions.FAILED: {
      const { adId } = action;
      return merge(state, {
        [adId]: {
          pending: false,
          failed: true,
        },
      });
    }

    case adActions.TRACKING_AD: {
      const { adId } = action;
      // the ad tracking thunk'd action will be doing the side-effect necessary
      // for tracking the impression. We store this in state so the component
      // responsible for dispatching a tracking action knows if it has
      // to be measuring if the component has made an impression or not.
      // (e.g., the posts list ad has to track if its been scrolled onto the screen).

      return merge(state, {
        [adId ]: {
          impressionTracked: true,
        },
      });
    }

    default: return state;
  }
}
