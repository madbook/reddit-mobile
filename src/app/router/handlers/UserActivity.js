import { BaseHandler, METHODS } from '@r/platform/router';

import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { POSTS_ACTIVITY } from 'app/actions/activities';

import * as activitiesActions from 'app/actions/activities';
import { fetchUserBasedData } from './handlerCommon';
import { urlWith } from 'lib/urlWith';

export default class UserActivityHandler extends BaseHandler {
  static activityURL(userName, activity) {
    return urlWith(`/u/${userName}/activity`, { activity });
  }

  static PageParamsToActivitiesParams({ urlParams, queryParams }) {
    const { userName } = urlParams;
    let { sort, activity } = queryParams;
    const { before, after } = queryParams;
    sort = sort || SORTS.CONFIDENCE;
    activity = activity || POSTS_ACTIVITY;

    return cleanObject({
      user: userName,
      sort,
      activity,
      before,
      after,
    });
  }

  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const activitiesParams = UserActivityHandler.PageParamsToActivitiesParams(this);
    dispatch(activitiesActions.fetch(activitiesParams));

    fetchUserBasedData(dispatch);
  }
}
