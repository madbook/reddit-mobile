import { redirect } from '@r/platform/actions';
import { markBannerClosed, shouldNotShowBanner } from 'lib/smartBannerState';
import {
  trackPreferenceEvent,
  XPROMO_APP_STORE_VISIT,
  XPROMO_DISMISS } from 'lib/eventUtils';


export const SHOW = 'XPROMO__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'XPROMO__HIDE';
export const hide = () => ({ type: HIDE });

export const PROMO_CLICKED = 'XPROMO__PROMO_CLICKED';
export const promoClicked = () => ({ type: PROMO_CLICKED });

export const PROMO_SCROLLSTART = 'XPROMO__SCROLLSTART';
export const promoScrollStart = () => ({ type: PROMO_SCROLLSTART });
export const PROMO_SCROLLPAST = 'XPROMO__SCROLLPAST';
export const promoScrollPast = () => ({ type: PROMO_SCROLLPAST });
export const PROMO_SCROLLUP = 'XPROMO__SCROLLUP';
export const promoScrollUp = () => ({ type: PROMO_SCROLLUP });

export const RECORD_SHOWN = 'XPROMO__RECORD_SHOWN';
export const recordShown = url => ({
  type: RECORD_SHOWN,
  url,
});

export const TRACK_XPROMO_EVENT = 'XPROMO__TRACK_EVENT';
export const trackXPromoEvent = (eventType, data) => ({
  type: TRACK_XPROMO_EVENT,
  eventType,
  data,
});

export const LOGIN_REQUIRED = 'XPROMO__LOGIN_REQUIRED';
export const loginRequired = () => ({ type: LOGIN_REQUIRED });

const EXTERNAL_PREF_NAME = 'hide_mweb_xpromo_banner';

// element is the interface element through which the user dismissed the
// crosspromo experience.
export const close = () => async (dispatch, getState) => {
  markBannerClosed();
  dispatch(hide());

  // We use a separate externally-visible name/value for the preference for
  // clarity when analyzing these events in our data pipeline.
  trackPreferenceEvent(getState(), {
    modified_preferences: [EXTERNAL_PREF_NAME],
    user_preferences: {
      [EXTERNAL_PREF_NAME]: true,
    },
  });

};

export const checkAndSet = () => async (dispatch) => {
  if (!shouldNotShowBanner()) {
    dispatch(show());
  }
};

export const logAppStoreNavigation = visitType => async (dispatch) => {
  dispatch(trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: 'app_store_visit' }));
  dispatch(trackXPromoEvent(XPROMO_APP_STORE_VISIT, { visit_trigger: visitType }));
};

export const navigateToAppStore = url => async (dispatch) => {
  // TODO (skrisman): There's no guarantee that events in `logAppStoreNavigation`
  // will actually finish their requests by the time we redirect. For now we
  // put a delay and hope for the best. We need the event tracker to return a
  // promise if we want to handle this correctly.
  setTimeout(() => dispatch(redirect(url)), 250);
};
