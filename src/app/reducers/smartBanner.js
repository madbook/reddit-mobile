import merge from 'platform/merge';

import * as xpromoActions from 'app/actions/xpromo';
import * as loginActions from 'app/actions/login';
import { markBannerClosed } from 'lib/smartBannerState';

export const DEFAULT = {
  showBanner: false,
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
