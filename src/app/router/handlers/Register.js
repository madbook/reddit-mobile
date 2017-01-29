import { BaseHandler, METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import ValidationError from 'apiClient/errors/ValidationError';
import { registerUser } from 'app/models/Register';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';
import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, trackPageEvents } from 'lib/eventUtils';


export default class Register extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    trackPageEvents(getState());
  }

  async [METHODS.POST](dispatch, getState) {
    const { username, password, email, newsletter, gRecaptchaResponse } = this.bodyParams;
    let successful = true;
    let errorCode = null;

    try {
      const newSession = await registerUser(username, password, email,
                                            newsletter, gRecaptchaResponse);
      dispatch(sessionActions.setSession(newSession));
      dispatch(loginActions.loggedIn());

      // This is awaited to guarantee the user is loaded for event logging
      await dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));

    } catch (e) {
      successful = false;
      if (e instanceof ValidationError && e.errors && e.errors[0]) {
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
    email: data.email,
    newsletter: data.newsletter && data.newsletter[0] === 'on',
  };

  if (!successful && errorCode) {
    payload.process_notes = errorCode;
  }

  getEventTracker().track('login_events', 'cs.register_attempt', payload);
}
