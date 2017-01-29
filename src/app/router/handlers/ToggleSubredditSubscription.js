import { BaseHandler, METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import { LOGGEDOUT_REDIRECT } from 'app/constants';
import * as subscriptionActions from 'app/actions/subscribedSubreddits';

export default class ToggleSubredditSubscription extends BaseHandler {
  async [METHODS.POST](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      return dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
    }

    dispatch(subscriptionActions.toggleSubscription(this.bodyParams));
  }
}
