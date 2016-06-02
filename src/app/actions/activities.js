import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { paramsToActiviesRequestId } from 'app/models/ActivitiesRequest';
import { endpoints } from '@r/api-client';
import { receivedResponse } from './apiResponse';

const { ActivitiesEndpoint } = endpoints;

export const POSTS_ACTIVITY = 'submitted';
export const COMMENTS_ACTIVITY = 'comments';

export const FETCHING_ACTIVITIES = 'FETCHING_ACTIVITIES';
export const fetching = (id, params) => ({ type: FETCHING_ACTIVITIES, id, params });

export const RECEIVED_ACTIVITIES = 'RECEIVED_ACTIVITIES';
export const received = (id, results) => ({ type: RECEIVED_ACTIVITIES, id, results });

export const fetch = activiesParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToActiviesRequestId(activiesParams);

  if (state.activitiesRequests[id]) { return; }

  dispatch(fetching(id, activiesParams));

  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await ActivitiesEndpoint.get(apiOptions, activiesParams);
  dispatch(receivedResponse(apiResponse));
  dispatch(received(id, apiResponse.results));
};
