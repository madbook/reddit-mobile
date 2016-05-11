import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import * as voteActions from '../../actions/voteActions';

export default class Login extends BaseHandler {
  async [METHODS.POST](dispatch, getState/*, utils*/) {
    const { thingId } = this.urlParams;
    const direction = parseInt(this.bodyParams.direction);

    const state = getState();

    try {
      dispatch(voteActions.vote(thingId, direction));
      dispatch(platformActions.gotoPageIndex(state.platform.history.length - 1));
    } catch (e) {
      console.log('Error voting');
      console.log(e);
    }
  }
}
