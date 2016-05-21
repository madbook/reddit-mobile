import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import * as voteActions from 'app/actions/vote';

export default class Vote extends BaseHandler {
  async [METHODS.POST](dispatch, getState, { waitForState }) {
    const { thingId } = this.urlParams;
    const direction = parseInt(this.bodyParams.direction);
    const state = getState();

    if (!state.session.isValid) {
      return dispatch(platformActions.setPage('/login'));
    }

    await waitForState(state => state.session.isValid && !state.sessionRefreshing, () => {
      try {
        dispatch(voteActions.vote(thingId, direction));
        dispatch(platformActions.gotoPageIndex(state.platform.history.length - 1));
      } catch (e) {
        console.log('Error voting');
        console.log(e);
      }
    });
  }
}
