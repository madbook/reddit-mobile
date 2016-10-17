import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import { LOGGEDOUT_REDIRECT } from 'app/constants';
import { fetchUserBasedData } from './handlerCommon';
import { trackPageEvents } from 'lib/eventUtils';

export default class DirectMessage extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    if (!getState().session.isValid) {
      return dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
    }
    await fetchUserBasedData(dispatch);

    trackPageEvents(getState());
  }
}
