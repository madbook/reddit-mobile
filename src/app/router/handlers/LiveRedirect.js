import * as platformActions from 'platform/actions';
import { BaseHandler, METHODS } from 'platform/router';
import config from 'config';

export default class LiveRedirectHandler extends BaseHandler {
  async [METHODS.GET](dispatch) {
    dispatch(platformActions.redirect(`${config.reddit}${this.originalUrl}`));
  }
}
