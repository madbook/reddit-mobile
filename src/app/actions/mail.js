import { endpoints, errors } from '@r/api-client';
const { ResponseError } = errors;

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

export const fetchInbox = (mailType, threadId) => async (dispatch, getState) => {
  const apiOptions = apiOptionsFromState(getState());
  dispatch(setInboxPending(mailType));

  const data = { type: mailType };
  if (threadId) {
    data.thread = threadId;
  }

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
