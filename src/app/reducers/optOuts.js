import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import { XPROMO_INTERSTITIAL_OPT_OUT } from 'app/constants';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE: {
      const { queryParams } = action.payload;

      const xpromoSetting = queryParams[XPROMO_INTERSTITIAL_OPT_OUT];

      // If the setting is not present, we treat it as such.
      if (xpromoSetting === undefined) {
        return state;
      }

      // Unset the flag
      if (xpromoSetting === 'false') {
        return merge(state, {
          xpromoInterstitial: undefined,
        });
      }

      return merge(state, {
        xpromoInterstitial: true,
      });
    }

    default: return state;
  }
}
