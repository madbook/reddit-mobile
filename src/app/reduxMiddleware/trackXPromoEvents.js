import * as loginActions from 'app/actions/login';
import * as xpromoActions from 'app/actions/xpromo';
import { XPROMO_DISMISS, trackXPromoEvent } from 'lib/eventUtils';

export default function xpromoEventTracker() {
  return store => next => action => {
    const state = store.getState();
    if (action.type === xpromoActions.TRACK_XPROMO_EVENT) {
      trackXPromoEvent(state, action.eventType, action.data);
    } else if (action.type === loginActions.LOGGED_IN && state.smartBanner.loginRequired) {
      trackXPromoEvent(state, XPROMO_DISMISS, { dismiss_type: 'logged_in' });
    }
    return next(action);
  };
}
