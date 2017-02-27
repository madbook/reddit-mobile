import { redirect } from 'platform/actions';
import {
  getXPromoListingClickLink,
  markBannerClosed,
  markListingClickTimestampLocalStorage,
  shouldNotShowBanner,
  shouldNotListingClick,
} from 'lib/smartBannerState';
import {
  trackPreferenceEvent,
  XPROMO_APP_STORE_VISIT,
  XPROMO_DISMISS,
  XPROMO_VIEW,
} from 'lib/eventUtils';

import {
  XPROMO_LISTING_CLICK_EVENTS_NAME,
} from 'app/constants';

import features from 'app/featureFlags';
import { flags } from 'app/constants';
const { XPROMO_LISTING_CLICK_EVERY_TIME_COHORT } = flags;


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

export const CAN_LISTING_CLICK = 'XPROMO__CAN_LISTING_CLICK';
export const canListingClick = () => ({ type: CAN_LISTING_CLICK });

export const MARK_LISTING_CLICK_TIMESTAMP = 'XPROMO__MARK_LISTING_CLICK_TIMESTAMP';
export const markListingClickTimeStamp = () => async (dispatch) => {
  dispatch({ type: MARK_LISTING_CLICK_TIMESTAMP });
  markListingClickTimestampLocalStorage();
};

export const XPROMO_LISTING_CLICKED = 'XPROMO__LISTING_CLICKED';
export const promoListingClicked = () => ({ type: XPROMO_LISTING_CLICKED });

export const XPROMO_LISTING_CLICK_ANIMATION_COMPLETED = 'XPROMO__LISTING_CLICK_ANIMATION_COMPLETED';
export const promoListingAnimated = () => ({ type: XPROMO_LISTING_CLICK_ANIMATION_COMPLETED });

// max delay for the listing click interstitial to be on screen after trying
// to navigate to the app store / installed app. If the user doesn't give
// permission to navigate out of the browser, the promo will still be on screen.
// Normally this is handled by a 'on:focus' listener in the `Client.js`,
// but in this scenario we won't always have a focus event. You may be wondering,
// why should there be a listener in the Client at all? Having it close on
// visibility change protects us from Javascript not executing if the page
// goes into the background, and ensures we hide the interstitial immediately
// when the user comes back to the browser.
const MAX_LISTING_CLICK_INTERSTITIAL_ON_SCREEN = 4000;

// amount of delay from the animation completing before redirecting.
const LISTING_ANIMATION_COMPLETE_PAUSE = 200;

export const showListingClickInterstitial = () => async (dispatch, _, { waitForAction }) => {
  dispatch(promoListingClicked());

  return new Promise(resolve => {
    // wait for the animation to finish, then pause before resolving.
    // we use a spring-based animation, so we can't specify the exact duration
    waitForAction(action => action.type === XPROMO_LISTING_CLICK_ANIMATION_COMPLETED, () => {
      setTimeout(resolve, LISTING_ANIMATION_COMPLETE_PAUSE);
    });
  });
};

export const XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL = 'XPROMO__HIDE_LISTING_CLICK_INTERSTITIAL';
export const hideListingClickInterstitialIfNeeded = () => async (dispatch, getState) => {
  const state = getState();

  if (!state.smartBanner.showingListingClickInterstitial) {
    return;
  }

  dispatch({ type: XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL });
};

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

export const checkAndSet = () => async (dispatch, getState) => {
  if (!shouldNotShowBanner()) {
    dispatch(show());
  }

  if (!shouldNotListingClick(getState())) {
    dispatch(canListingClick());
  }
};

let _listingIntersitialHideTimer = null;

export const performListingClick = (postId, listingClickType) => async (dispatch, getState) => {
  if (getState().smartBanner.showingListingClickInterstitial) {
    return;
  }

  // _listingIntersitialHideTimer tracks the timeout used to ensure we don't
  // indefinetly show the listing interstitial. If the user is in everytime and:
  // clicks -> comes back -> clicks again, we need to reset that timer.
  if (_listingIntersitialHideTimer) {
    clearTimeout(_listingIntersitialHideTimer);
  }

  const extraEventData = {
    interstitial_type: XPROMO_LISTING_CLICK_EVENTS_NAME,
    listing_click_type: listingClickType,
  };

  await Promise.all([
    // resolves when the interstitial animation is complete
    dispatch(showListingClickInterstitial()),
    dispatch(trackXPromoEvent(XPROMO_VIEW, extraEventData)),
    dispatch(trackXPromoEvent(XPROMO_APP_STORE_VISIT, {
      ...extraEventData,
      visit_trigger: XPROMO_LISTING_CLICK_EVENTS_NAME,
    })),
  ]);

  // For the every two week cohort, record the click
  const state = getState();
  const featureContext = features.withContext({ state });
  if (!featureContext.enabled(XPROMO_LISTING_CLICK_EVERY_TIME_COHORT)) {
    dispatch(markListingClickTimeStamp());
  }

  const listingClickURL = getXPromoListingClickLink(getState(), postId, listingClickType);
  dispatch(navigateToAppStore(listingClickURL));

  // The user might not approve opening the link externally, in which case
  // we'll still be on this page. So we should close the interstitial.
  _listingIntersitialHideTimer = setTimeout(
    () => dispatch(hideListingClickInterstitialIfNeeded()),
    MAX_LISTING_CLICK_INTERSTITIAL_ON_SCREEN
  );
};

export const logAppStoreNavigation = visitType => async (dispatch) => {
  return Promise.all([
    dispatch(trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: 'app_store_visit' })),
    dispatch(trackXPromoEvent(XPROMO_APP_STORE_VISIT, { visit_trigger: visitType })),
  ]);
};

export const navigateToAppStore = url => async (dispatch) => {
  dispatch(redirect(url));
};
