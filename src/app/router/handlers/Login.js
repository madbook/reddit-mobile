import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { errors } from '@r/api-client';

import Session from 'app/models/Session';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';
import { getBasePayload, logClientScreenView } from 'lib/eventUtils';


export default class Login extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    logClientScreenView(getBasePayload, getState());
  }

  async [METHODS.POST](dispatch) {
    const { username, password } = this.bodyParams;

    try {
      const newSession = await Session.fromLogin(username, password);
      dispatch(sessionActions.setSession(newSession));
      dispatch(loginActions.loggedIn());
      dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));

    } catch (e) {
      if (e instanceof errors.ValidationError && e.errors && e.errors[0]) {
        dispatch(sessionActions.sessionError(e.errors[0].error));
      } else {
        throw e;
      }
    }
  }
}
