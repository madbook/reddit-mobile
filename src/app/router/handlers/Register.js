import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import { registerUser } from 'app/models/Register';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';


export default class Register extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    logClientScreenView(getBasePayload, getState());
  }

  async [METHODS.POST](dispatch) {
    const { username, password, email, newsletter, gRecaptchaResponse } = this.bodyParams;
    try {
      const newSession = await registerUser(username, password, email,
                                            newsletter, gRecaptchaResponse);
      dispatch(sessionActions.setSession(newSession));
      dispatch(loginActions.loggedIn());
      dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));

    } catch (e) {
      const error = JSON.parse(e);
      dispatch(sessionActions.sessionError(error.error));

      return; // do nothing until session is better
    }
  }
}
