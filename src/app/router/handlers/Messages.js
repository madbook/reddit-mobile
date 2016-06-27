import { BaseHandler, METHODS } from '@r/platform/router';

import { fetchUserBasedData } from './handlerCommon';
import * as mailActions from 'app/actions/mail';

export default class Messages extends BaseHandler {
  async [METHODS.GET](dispatch/*, getState, utils*/) {
    const { mailType } = this.urlParams;
    fetchUserBasedData(dispatch);
    dispatch(mailActions.fetchInbox(mailType));
  }
}
