import * as platformActions from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

import config from 'config';

export default class LiveRedirectHandler extends BaseHandler {
  async [METHODS.GET](dispatch) {
    dispatch(platformActions.redirect(`${config.reddit}${this.originalUrl}`));
  }
}
