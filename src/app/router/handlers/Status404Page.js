import { BaseHandler, METHODS } from '@r/platform/router';
import { setStatus } from '@r/platform/actions';

export default class Status404Page extends BaseHandler {
  async [METHODS.GET](dispatch) {
    dispatch(setStatus(404));
  }
}
