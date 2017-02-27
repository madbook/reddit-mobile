import merge from 'platform/merge';

import * as xpromoActions from 'app/actions/xpromo';
import * as loginActions from 'app/actions/login';
import { markBannerClosed } from 'lib/smartBannerState';

export const DEFAULT = {
  showBanner: false,
  canListingClick: false,
  showingListingClickInterstitial: false,
  haveShownXPromo: false,
  xPromoShownUrl: null,
  loginRequired: false,
  scrolledPast: false,
  scrolledStart: false,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case xpromoActions.SHOW: {
      return merge(state, {
        showBanner: true,
        ...action.data,
      });
    }

    case xpromoActions.HIDE: {
      return DEFAULT;
    }

    case xpromoActions.RECORD_SHOWN: {
      return merge(state, {
        haveShownXPromo: true,
        xPromoShownUrl: action.url,
      });
    }

    case xpromoActions.PROMO_SCROLLSTART: {
      return merge(state, {
        scrolledStart: true,
      });
    }

    case xpromoActions.PROMO_SCROLLPAST: {
      return merge(state, {
        scrolledPast: true,
      });
    }

    case xpromoActions.PROMO_SCROLLUP: {
      return merge(state, {
        scrolledPast: false,
      });
    }

    case xpromoActions.LOGIN_REQUIRED: {
      return merge(state, {
        loginRequired: true,
      });
    }

    case xpromoActions.PROMO_CLICKED: {
      markBannerClosed();
      return merge(state, {
        showBanner: false,
      });
    }

    case xpromoActions.CAN_LISTING_CLICK: {
      return merge(state, {
        canListingClick: true,
      });
    }

    case xpromoActions.XPROMO_LISTING_CLICKED: {
      return merge(state, {
        showingListingClickInterstitial: true,
      });
    }

    case xpromoActions.XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL: {
      return merge(state, {
        showingListingClickInterstitial: false,
      });
    }

    case xpromoActions.MARK_LISTING_CLICK_TIMESTAMP: {
      return merge(state, {
        canListingClick: false,
      });
    }

    case loginActions.LOGGED_IN: {
      if (state.loginRequired) {
        markBannerClosed();
        return merge(state, {
          showBanner: false,
          loginRequired: false,
        });
      }
      return state;
    }

    default:
      return state;
  }
}
