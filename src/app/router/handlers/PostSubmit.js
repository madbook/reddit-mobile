import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import * as subredditActions from 'app/actions/subreddits';

import { fetchUserBasedData } from 'app/router/handlers/handlerCommon';

export class PostSubmitHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage('/login'));
      return;
    }
    fetchUserBasedData(dispatch);
  }
}

export class PostSubmitCommunityHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage('/login'));
      return;
    }

    fetchUserBasedData(dispatch);

    state.recentSubreddits.forEach(subredditName => {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    });
  }
}
