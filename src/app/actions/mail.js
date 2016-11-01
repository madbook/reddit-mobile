import { METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { endpoints, errors } from '@r/api-client';
const { ResponseError, ValidationError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export const FETCHING = 'MAIL__FETCHING';
export const setInboxPending = mailType => ({
  type: FETCHING,
  mailType,
});

export const RECEIVED = 'MAIL__RECEIVED';
export const setInboxSuccess = (mailType, apiResponse) => ({
  type: RECEIVED,
  mailType,
  apiResponse,
});

export const FAILED = 'MAIL__FAILED';
export const setInboxFailure = (mailType, error) => ({
  type: FAILED,
  mailType,
  error,
});

export const ADD_REPLY = 'MAIL__ADD_REPLY';
export const addReply = data => ({
  type: ADD_REPLY,
  data,
});

export const FAILED_MESSAGE = 'MAIL__FAILED_MESSAGE';
export const failedMessage = error => ({
  type: FAILED_MESSAGE,
  error,
  message: 'There was an error sending your message.',
});

export const postMessage = data => async (dispatch, getState) => {
  const apiOptions = apiOptionsFromState(getState());
  let message;

  try {
    message = await endpoints.MessagesEndpoint.post(apiOptions, data);
  } catch (e) {
    if (e instanceof ValidationError) {
      dispatch(failedMessage(e));
    } else {
      throw e;
    }
    return;
  }

  if (message && message.firstMessageName) {
    // This is the case of replying to a message thread -- we get the model
    // back from the new message, and we add it to the head (firstMessageName).
    // Note: if it's null, then it was a new message thread
    const { messages } = getState();
    const parent = messages[message.firstMessageName];
    const newParent = parent.set('replies', [...parent.replies, message.name]);
    const data = {
      messages: {
        [message.name]: message,
        [message.firstMessageName]: newParent,
      },
    };
    dispatch(addReply(data));
  } else {
    dispatch(platformActions.navigateToUrl(METHODS.GET, '/message/messages'));
  }
};

export const fetchInbox = (mailType, queryParams, threadId) => async (dispatch, getState) => {
  const apiOptions = apiOptionsFromState(getState());
  dispatch(setInboxPending(mailType));

  const data = { type: mailType };
  if (threadId) {
    data.thread = threadId;
  }
  data.query = queryParams;

  try {
    const apiResponse = await endpoints.MessagesEndpoint.get(apiOptions, data);
    dispatch(setInboxSuccess(mailType, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(setInboxFailure(mailType, e));
    } else {
      throw e;
    }
  }
};
