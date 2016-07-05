import { BaseHandler, METHODS } from '@r/platform/router';
import { fetchUserBasedData } from './handlerCommon';

export default class ReportHandler extends BaseHandler {
  async [METHODS.GET](dispatch) {
    fetchUserBasedData(dispatch);
  }
}
