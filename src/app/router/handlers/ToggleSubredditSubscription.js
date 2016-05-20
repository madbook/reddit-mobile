import { BaseHandler, METHODS } from '@r/platform/router';
import * as subredditActions from 'app/actions/subreddits';

export default class ToggleSubredditSubscription extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(subredditActions.toggleSubscription(this.bodyParams));
  }
}
