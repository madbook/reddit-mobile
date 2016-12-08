import { endpoints, errors } from '@r/api-client';
const { ActivitiesEndpoint } = endpoints;
const { ResponseError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { paramsToActiviesRequestId } from 'app/models/ActivitiesRequest';

export const POSTS_ACTIVITY = 'submitted';
export const COMMENTS_ACTIVITY = 'comments';

export const FETCHING_ACTIVITIES = 'FETCHING_ACTIVITIES';
export const fetching = (id, params) => ({
  type: FETCHING_ACTIVITIES,
  id,
  params,
});

export const RECEIVED_ACTIVITIES = 'RECEIVED_ACTIVITIES';
export const received = (id, apiResponse) => ({
  type: RECEIVED_ACTIVITIES,
  id,
  apiResponse,
});

export const FAILED = 'FAILED_ACTIVITIES';
export const failed = (id, error) => ({
  type: FAILED,
  error,
});

export const fetch = activiesParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToActiviesRequestId(activiesParams);

  if (state.activitiesRequests[id]) { return; }

  dispatch(fetching(id, activiesParams));

  try {
    const apiOptions = apiOptionsFromState(state);
    const apiResponse = await ActivitiesEndpoint.get(apiOptions, activiesParams);
    dispatch(received(id, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(id, e));
    } else {
      throw e;
    }
  }
};
