import { BaseHandler, METHODS } from '@r/platform/router';
import * as subscriptionActions from 'app/actions/subscribedSubreddits';

export default class ToggleSubredditSubscription extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(subscriptionActions.toggleSubscription(this.bodyParams));
  }
}
