import { POST } from 'apiClient/models/thingTypes';
import { BaseHandler, METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import * as rulesModalActions from 'app/actions/rulesModal';
import * as subredditActions from 'app/actions/subreddits';
import { flags, LOGGEDOUT_REDIRECT } from 'app/constants';
import features from 'app/featureFlags';
import { fetchUserBasedData } from 'app/router/handlers/handlerCommon';
import { trackPageEvents } from 'lib/eventUtils';

export class PostSubmitHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
      return;
    }

    await fetchUserBasedData(dispatch);

    trackPageEvents(getState());

    // Experiment to show subreddit rules at submit time.
    const { subredditName } = state.platform.currentPage.urlParams;
    const featureName = 'rules_modal_on_submit';
    const key = rulesModalActions.getLocalStorageKey(featureName, subredditName);

    // Disable during shell rendering, necessary to ensure that the modal hasn't
    // been marked as "seen" in localStorage before showing
    if (state.platform.shell) { return; }
    // Disable if we aren't in a subreddit context
    if (!subredditName) { return; }
    // Disable if modal has been marked as "seen" in localStorage
    if (state.rulesModal[key]) { return; }
    
    const feature = features.withContext({ state });
    const clickAnywhereEnabled = feature.enabled(flags.RULES_MODAL_ON_SUBMIT_CLICK_ANYWHERE);
    const clickButtonEnabled = feature.enabled(flags.RULES_MODAL_ON_SUBMIT_CLICK_BUTTON);

    // Disable if none of the relevant features are enabled
    if (!(clickAnywhereEnabled || clickButtonEnabled)) { return; }

    const isRequired = clickButtonEnabled;
    const thingType = POST;
    const onDecline = platformActions.navigateToUrl('get', `/r/${subredditName}`);

    dispatch(rulesModalActions.display(
      featureName,
      subredditName,
      thingType,
      isRequired,
      onDecline
    ));
  }
}

export class PostSubmitCommunityHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
      return;
    }

    state.recentSubreddits.forEach(subredditName => {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    });

    await fetchUserBasedData(dispatch);

    trackPageEvents(getState());
  }
}
