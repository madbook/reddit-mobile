import { endpoints } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export const FETCHING = 'MAIL__FETCHING';
export const RECEIVED = 'MAIL__RECEIVED';
export const FAILURE = 'MAIL__FAILURE';

export const setInboxPending = mailType => ({
  mailType,
  type: FETCHING,
});

export const setInboxSuccess = (mailType, apiResponse) => ({
  mailType,
  apiResponse,
  type: RECEIVED,
});

export const setInboxFailure = (mailType, error) => ({
  mailType,
  error,
});

export const fetchInbox = mailType => async (dispatch, getState) => {
  const apiOptions = apiOptionsFromState(getState());
  dispatch(setInboxPending(mailType));

  try {
    const apiResponse = await endpoints.MessagesEndpoint.get(apiOptions, { type: mailType });
    dispatch(setInboxSuccess(mailType, apiResponse));
  } catch (e) {
    dispatch(setInboxFailure(mailType, e));
  }
};
