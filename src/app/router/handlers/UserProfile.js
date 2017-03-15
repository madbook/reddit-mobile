import { BaseHandler, METHODS } from 'platform/router';
import * as accountActions from 'app/actions/accounts';
import { fetchUserBasedData } from './handlerCommon';
import { trackPageEvents, buildProfileData } from 'lib/eventUtils';

export default class UserProfilerHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { userName } = this.urlParams;

    await Promise.all([
      dispatch(accountActions.fetch({ name: userName })),
      fetchUserBasedData(dispatch),
    ]);

    const latestState = getState();
    trackPageEvents(latestState, buildProfileData(latestState, {
      screen_name: 'profile_about',
    }));
  }
}
