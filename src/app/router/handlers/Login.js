import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { errors } from '@r/api-client';

import Session from 'app/models/Session';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';
import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, trackPageEvents } from 'lib/eventUtils';


export default class Login extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    trackPageEvents(getState());
  }

  async [METHODS.POST](dispatch, getState) {
    const { username, password, redirectTo } = this.bodyParams;
    let successful = true;
    let errorCode = null;

    try {
      const newSession = await Session.fromLogin(username, password);
      dispatch(sessionActions.setSession(newSession));
      dispatch(loginActions.loggedIn());

      // This is awaited to guarantee the user is loaded for event logging
      await dispatch(platformActions.redirect(redirectTo));
    } catch (e) {
      successful = false;
      if (e instanceof errors.ValidationError && e.errors && e.errors[0]) {
        errorCode = e.errors[0].error;
        dispatch(sessionActions.sessionError(errorCode));
      } else {
        throw e;
      }
    }

    logAttempt(this.bodyParams, successful, errorCode, getState());
  }
}

function logAttempt(data, successful, errorCode, state) {
  const payload = {
    ...getBasePayload(state),
    successful,
    user_name: data.username,
  };

  if (!successful && errorCode) {
    payload.process_notes = errorCode;
  }

  getEventTracker().track('login_events', 'cs.login_attempt', payload);
}
