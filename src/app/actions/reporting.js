import { requestUtils } from '@r/api-client';
import { errors } from '@r/api-client';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

const { apiRequest } = requestUtils;
const { ResponseError } = errors;

export const REPORT = 'REPORT';
export const MODAL_TYPE = 'REPORTING';

export const report = thingId => ({
  type: REPORT,
  modalType: MODAL_TYPE,
  modalProps: { thingId },
});


export const SUBMIT = 'REPORT__SUBMIT';
export const SUCCESS = 'REPORT__SUCCESS';
export const FAILURE = 'REPORT_FAILURE';

export const submit = (thingId, reason) => async (dispatch, getState) => {
  dispatch({ type: SUBMIT });

  const apiOptions = apiOptionsFromState(getState());
  try {
    await apiRequest(apiOptions, 'POST', 'api/report', {
      type: 'form',
      body: { reason, thing_id: thingId, api_type: 'json' },
    });

    dispatch({ type: SUCCESS, message: 'Thanks for reporting!' });

  } catch (e) {
    dispatch({ type: FAILURE });
    if (!(e instanceof ResponseError)) {
      throw e;
    }
  }
};
