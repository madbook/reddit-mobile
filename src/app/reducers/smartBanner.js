import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as smartBannerActions from 'app/actions/smartBanner';

export const DEFAULT = {
  showBanner: false,
  haveShownXPromo: false,
  xPromoShownUrl: null,
  clickUrl: null,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case smartBannerActions.SHOW: {
      return merge(state, {
        showBanner: true,
        ...action.data,
      });
    }

    case smartBannerActions.HIDE: {
      return DEFAULT;
    }

    case smartBannerActions.RECORD_SHOWN: {
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
