import find from 'lodash/find';

import { BaseHandler, METHODS } from '@r/platform/router';

import * as accountActions from 'app/actions/accounts';
import { fetchUserBasedData } from './handlerCommon';
import { getBasePayload, convertId, logClientScreenView } from 'lib/eventUtils';

export default class UserProfilerHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { userName } = this.urlParams;

    await Promise.all([
      dispatch(accountActions.fetch({ name: userName })),
      fetchUserBasedData(dispatch),
    ]);

    logClientScreenView(buildScreenViewData, getState());
  }
}

function buildScreenViewData(state) {
  const { userName: name } = state.platform.currentPage.urlParams;
  const user = find(state.accounts, (_, k) => k.toLowerCase() === name.toLowerCase());

  return {
    target_name: user.name,
    target_fullname: user.id,
    target_type: 'account',
    target_id: convertId(user.id),
    ...getBasePayload(state),
  };
}
