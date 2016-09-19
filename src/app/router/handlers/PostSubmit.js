import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import * as subredditActions from 'app/actions/subreddits';
import { fetchUserBasedData } from 'app/router/handlers/handlerCommon';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';

export class PostSubmitHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage('/login'));
      return;
    }

    await fetchUserBasedData(dispatch);

    logClientScreenView(getBasePayload, getState());
  }
}

export class PostSubmitCommunityHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (!state.session.isValid) {
      dispatch(platformActions.setPage('/login'));
      return;
    }

    state.recentSubreddits.forEach(subredditName => {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    });

    await fetchUserBasedData(dispatch);

    logClientScreenView(getBasePayload, getState());
  }
}
