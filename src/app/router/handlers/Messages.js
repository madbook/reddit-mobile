import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import * as mailActions from 'app/actions/mail';
import { fetchUserBasedData } from './handlerCommon';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';

export default class Messages extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    if (!getState().session.isValid) {
      return dispatch(platformActions.setPage('/register'));
    }

    const mailType = this.urlParams.mailType ? this.urlParams.mailType : 'messages';
    dispatch(mailActions.fetchInbox(mailType, this.urlParams.threadId));

    await fetchUserBasedData(dispatch);

    logClientScreenView(getBasePayload, getState());
  }
}
