import { BaseHandler, METHODS } from '@r/platform/router';
import * as subredditRulesActions from 'app/actions/subredditRules';
import * as subredditActions from 'app/actions/subreddits';

export default class SubredditRulesPage extends BaseHandler {
  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { subredditName } = this.urlParams;
    dispatch(subredditRulesActions.fetchSubredditRules(subredditName));
    dispatch(subredditActions.fetchSubreddit(subredditName));
  }
}
