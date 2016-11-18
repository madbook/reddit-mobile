import { markBannerClosed, shouldShowBanner } from 'lib/smartBannerState';

export const SHOW = 'SMARTBANNER__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'SMARTBANNER__HIDE';
export const hide = () => ({ type: HIDE });

export const close = () => async (dispatch) => {
  markBannerClosed();
  dispatch(hide());
};

export const checkAndSet = () => async (dispatch) => {
  if (shouldShowBanner()) {
    dispatch(show());
  }
};
