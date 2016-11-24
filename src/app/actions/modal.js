import { flags as flagConstants } from 'app/constants';
import featureFlags from 'app/featureFlags';

import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';

import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData } from 'lib/eventUtils';

export const CLOSE = 'MODAL__CLOSE';
export const closeModal = () => ({ type: CLOSE });

export const XPROMO_CLICK = 'MODAL_XPROMO_CLICK';
export const xpromoClickModal = hash => ({ type: XPROMO_CLICK, modalProps: { hash } });

export const showXpromoModal = () => async (dispatch, getState) => {
  const state = getState();
  const features = featureFlags.withContext({ state });
  const { showBanner } = state.smartBanner;
  const { VARIANT_XPROMO_CLICK } = flagConstants;

  if (showBanner && features.enabled(VARIANT_XPROMO_CLICK)) {
    const { urlParams, queryParams } = state.platform.currentPage;
    const getPageParams = PostsFromSubreddit.pageParamsToSubredditPostsParams;
    const pageParams = getPageParams({ urlParams, queryParams });
    const hash = paramsToPostsListsId(pageParams);

    // We need to issue a separate screenview event (denoting it being a modal)
    // because the bucketing event is issued regardless of whether the modal
    // is activated.
    const payload = {
      ...getBasePayload(state),
      ...buildSubredditData(state),
      target_type: 'modal',
    };
    getEventTracker().track('screenview_events', 'cs.screenview_mweb', payload);
    dispatch(xpromoClickModal(hash));
  }
};
