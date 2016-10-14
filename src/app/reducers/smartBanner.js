import merge from '@r/platform/merge';

import * as smartBannerActions from 'app/actions/smartBanner';

export const DEFAULT = {
  showBanner: false,
  clickUrl: null,
  impressionUrl: null,
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

    default:
      return state;
  }
}
