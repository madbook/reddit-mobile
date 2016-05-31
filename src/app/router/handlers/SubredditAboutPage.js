import { BaseHandler, METHODS } from '@r/platform/router';
import * as subredditActions from 'app/actions/subreddits';

import { fetchUserBasedData } from './handlerCommon';

export default class SubredditAboutPage extends BaseHandler {
  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { subredditName } = this.urlParams;
    dispatch(subredditActions.fetchSubreddit(subredditName));
    fetchUserBasedData(dispatch);
  }
}
