import { BaseHandler, METHODS } from '@r/platform/router';

import * as accountActions from 'app/actions/accounts';
import { fetchUserBasedData } from './handlerCommon';

export default class UserProfilerHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { userName } = this.urlParams;
    dispatch(accountActions.fetch({ name: userName }));
    fetchUserBasedData(dispatch);
  }
}
