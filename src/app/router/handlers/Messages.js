import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import { LOGGEDOUT_REDIRECT } from 'app/constants';
import * as mailActions from 'app/actions/mail';
import { fetchUserBasedData } from './handlerCommon';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';

export default class Messages extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    if (!getState().session.isValid) {
      return dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
    }

    const mailType = this.urlParams.mailType ? this.urlParams.mailType : 'messages';
    dispatch(mailActions.fetchInbox(mailType, this.queryParams, this.urlParams.threadId));

    await fetchUserBasedData(dispatch);

    logClientScreenView(getBasePayload, getState());
  }
}
