import { BaseHandler, METHODS } from '@r/platform/router';

import * as mailActions from 'app/actions/mail';
import { fetchUserBasedData } from './handlerCommon';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';

export default class Messages extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    dispatch(mailActions.fetchInbox(this.urlParams.mailType));
    await fetchUserBasedData(dispatch);

    logClientScreenView(getBasePayload, getState());
  }
}
