import { markBannerClosed, shouldShowBanner } from 'lib/smartBannerState';
import { trackPreferenceEvent } from 'lib/eventUtils';

export const SHOW = 'SMARTBANNER__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'SMARTBANNER__HIDE';
export const hide = () => ({ type: HIDE });

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
  if (shouldShowBanner()) {
    dispatch(show());
  }
};
