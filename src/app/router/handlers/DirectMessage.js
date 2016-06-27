import { BaseHandler, METHODS } from '@r/platform/router';
import { endpoints } from '@r/api-client';

import { fetchUserBasedData } from './handlerCommon';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export default class DirectMessage extends BaseHandler {
  async [METHODS.GET](dispatch/*, getState, utils*/) {
    fetchUserBasedData(dispatch);
  }

  async [METHODS.POST](dispatch, getState/*, utils*/) {
    const data = this.bodyParams;
    const apiOptions = apiOptionsFromState(getState());
    await endpoints.MessagesEndpoint.post(apiOptions, data);
  }
}
