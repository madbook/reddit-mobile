import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { shouldShowBanner, markBannerClosed } from 'lib/smartBannerState';
import TrackingPixel from 'lib/TrackingPixel';

export const SHOW = 'SMARTBANNER__SHOW';
export const show = (impressionUrl, clickUrl) => ({
  type: SHOW,
  data: {
    impressionUrl,
    clickUrl,
  },
});

export const HIDE = 'SMARTBANNER__HIDE';
export const hide = () => ({ type: HIDE });

export const close = () => async (dispatch) => {
  markBannerClosed();
  dispatch(hide());
};

export const checkAndSet = () => async (dispatch, getState) => {
  const state = getState();
  const routeMeta = getRouteMetaFromState(state);
  const {
    showBanner,
    impressionUrl,
    clickUrl,
  } = shouldShowBanner({
    actionName: routeMeta && routeMeta.name,
    userAgent: state.meta.userAgent || '',
    user: state.accounts[state.user.name],
  });
  if (showBanner) {
    dispatch(show(impressionUrl, clickUrl));

    // create a pixel to track the impressions
    (new TrackingPixel({ url: impressionUrl })).fire();
  }
};
