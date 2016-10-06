import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import { LOGGEDOUT_REDIRECT } from 'app/constants';
import * as voteActions from 'app/actions/vote';

export default class Vote extends BaseHandler {
  async [METHODS.POST](dispatch, getState, { waitForState }) {
    const { thingId } = this.urlParams;
    const direction = parseInt(this.bodyParams.direction);
    const state = getState();

    if (!state.session.isValid) {
      return dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
    }

    await waitForState(state => state.session.isValid && !state.sessionRefreshing, () => {
      dispatch(voteActions.vote(thingId, direction));
    });
  }
}
