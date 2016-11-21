import { markBannerClosed, shouldShowBanner } from 'lib/smartBannerState';

export const SHOW = 'SMARTBANNER__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'SMARTBANNER__HIDE';
export const hide = () => ({ type: HIDE });

// element is the interface element through which the user dismissed the
// crosspromo experience.
export const close = () => async (dispatch, getState) => {
  markBannerClosed(getState());
  dispatch(hide());
};

export const checkAndSet = () => async (dispatch) => {
  if (shouldShowBanner()) {
    dispatch(show());
  }
};
