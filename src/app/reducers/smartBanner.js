import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as smartBannerActions from 'app/actions/smartBanner';

export const DEFAULT = {
  showBanner: false,
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

    case platformActions.NAVIGATE_TO_URL: {
      return DEFAULT;
    }

    default:
      return state;
  }
}
