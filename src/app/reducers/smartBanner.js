import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as xpromoActions from 'app/actions/xpromo';

export const DEFAULT = {
  showBanner: false,
  haveShownXPromo: false,
  xPromoShownUrl: null,
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

    case platformActions.NAVIGATE_TO_URL: {
      if (state.haveShownXPromo) {
        return merge(state, {
          showBanner: false,
        });
      }

      return state;
    }

    default:
      return state;
  }
}
