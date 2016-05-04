import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

export default class Frontpage extends BaseHandler {
  async [METHODS.GET](dispatch, getState, utils) {
    const { originalUrl } = this;

  }
}
